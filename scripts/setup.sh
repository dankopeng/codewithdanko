#!/usr/bin/env bash
set -euo pipefail

# One-click setup & deploy script for CodeWithDanko
# Requirements: macOS (BSD sed), jq, openssl, git, node, npm
# This script will:
# 1) Ask for project name
# 2) Cloudflare login
# 3) Create D1 database
# 4) Update wrangler configs (backend/frontend), inject JWT_SECRET
# 5) npm install, build
# 6) Apply D1 migrations (remote)
# 7) Deploy backend, set API_BASE_URL, deploy frontend

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"
MIGRATIONS_DIR="$ROOT_DIR/infra/d1/migrations"
BOOTSTRAP_SQL="$ROOT_DIR/infra/d1/bootstrap.sql"

# --- Helpers ---
need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing dependency: $1" >&2
    exit 1
  fi
}

json_edit() {
  # $1: file, $2..: jq filter
  local file="$1"
  shift
  tmpfile="$(mktemp)"
  jq -e "$@" "$file" >"$tmpfile"
  mv "$tmpfile" "$file"
}

sed_in_place() {
  # BSD/macOS sed
  sed -i '' "$@"
}

extract_workers_url() {
  # Read from stdin and extract the last workers.dev URL
  awk '{print}' | grep -Eo 'https://[A-Za-z0-9.-]+\.workers\.dev' | tail -n 1
}

# --- Checks ---
need jq
need openssl
need node
need npm

# Always use Wrangler v4 explicitly to avoid legacy v3 behavior
WRANGLER="npx -y wrangler@4"
if ! $WRANGLER --version >/dev/null 2>&1; then
  echo "[ERROR] Failed to run wrangler@4 via npx" >&2
  exit 1
fi

# --- Ask project name ---
echo "Enter your new project name (e.g. myapp):"
read -r PROJECT_NAME
if [[ -z "${PROJECT_NAME}" ]]; then
  echo "[ERROR] Project name is required" >&2
  exit 1
fi

API_WORKER_NAME="${PROJECT_NAME}-api"
WEB_WORKER_NAME="${PROJECT_NAME}"
DB_NAME="${PROJECT_NAME}-db"

# Control whether to run migrations (default: skip)
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-1}"

# --- R2 disabled by default (storage-agnostic template) ---
USE_R2=0

# --- Cloudflare login ---
echo "\n==> Cloudflare login (a browser window may open)"
$WRANGLER login || true

# Auto-detect and export Cloudflare Account ID (pick the first one)
ACCOUNT_ID=$($WRANGLER whoami 2>/dev/null | awk '
  /\| Account ID \|/ { next } # skip header
  /│ .* │ [0-9a-f]{32} │/ {
    for (i=1; i<=NF; i++) {
      if ($i ~ /^[0-9a-f]{32}$/) { print $i; exit }
    }
  }
')
if [[ -n "$ACCOUNT_ID" ]]; then
  export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
  export CF_ACCOUNT_ID="$ACCOUNT_ID" # backward compatibility
  echo "Using Cloudflare Account ID: $ACCOUNT_ID"
else
  echo "[WARN] Could not auto-detect Cloudflare Account ID from 'wrangler whoami' output." >&2
  echo "       You may set it manually: export CLOUDFLARE_ACCOUNT_ID=<YOUR_ACCOUNT_ID>" >&2
fi

# Wrapper for wrangler calls (rely on CLOUDFLARE_ACCOUNT_ID env; do not append --account-id for v4.30 compat)
cf_wrangler() {
  $WRANGLER "$@"
}

# --- Create D1 DB ---
echo "\n==> Creating D1 database: ${DB_NAME}"
# Try to create; if it already exists, ignore error
cf_wrangler d1 create "${DB_NAME}" >/dev/null 2>&1 || true
# Always fetch info to get UUID
# 1) Try JSON (if supported), 2) Fallback to plain text parsing, 3) Fallback to list parsing
INFO_JSON=$(cf_wrangler d1 info "${DB_NAME}" --json 2>/dev/null || true)
D1_UUID=$(jq -r '.uuid // .database_uuid // empty' <<<"$INFO_JSON" 2>/dev/null || true)

if [[ -z "$D1_UUID" || "$D1_UUID" == "null" ]]; then
  INFO_TEXT=$(cf_wrangler d1 info "${DB_NAME}" 2>/dev/null || true)
  D1_UUID=$(echo "$INFO_TEXT" | awk '/[0-9a-f]{32}/ { for (i=1;i<=NF;i++) if ($i ~ /^[0-9a-f]{32}$/) { print $i; exit } }')
fi

if [[ -z "$D1_UUID" || "$D1_UUID" == "null" ]]; then
  LIST_OUT=$(cf_wrangler d1 list 2>/dev/null || true)
  D1_UUID=$(echo "$LIST_OUT" | awk -v name="$DB_NAME" 'index($0, name) { for (i=1;i<=NF;i++) if ($i ~ /^[0-9a-f]{32}$/) { print $i; exit } }')
fi

if [[ -z "$D1_UUID" || "$D1_UUID" == "null" ]]; then
  echo "[ERROR] Failed to get D1 UUID for ${DB_NAME}. Info output(s):" >&2
  if [[ -n "${INFO_JSON:-}" ]]; then echo "$INFO_JSON" >&2; fi
  if [[ -n "${INFO_TEXT:-}" ]]; then echo "$INFO_TEXT" >&2; fi
  if [[ -n "${LIST_OUT:-}" ]]; then echo "$LIST_OUT" >&2; fi
  exit 1
fi

# (R2 creation skipped)

# --- Generate JWT secret ---
JWT_SECRET=$(openssl rand -hex 32)

# --- Update backend wrangler.toml ---
API_TOML="$API_DIR/wrangler.toml"
if [[ ! -f "$API_TOML" && -f "$API_DIR/wrangler.toml.example" ]]; then
  cp "$API_DIR/wrangler.toml.example" "$API_TOML"
fi
if [[ ! -f "$API_TOML" ]]; then
  echo "[ERROR] Backend wrangler.toml not found" >&2
  exit 1
fi

# ensure env sections exist (append headers if missing)
grep -q "^\[env.production\]" "$API_TOML" || printf "\n[env.production]\n" >> "$API_TOML"
grep -q "^\[env.dev\]"         "$API_TOML" || printf "\n[env.dev]\n"         >> "$API_TOML"

# remove existing env.production d1 blocks to keep idempotent appends
awk '
  BEGIN{skip=0}
  /^\[\[env\.production\.d1_databases\]\]$/ {skip=1; next}
  /^\[/{ if(skip==1){skip=0} }
  skip==1{ next }
  { print }
' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"

# remove existing env.dev d1 blocks to keep idempotent appends
awk '
  BEGIN{skip=0}
  /^\[\[env\.dev\.d1_databases\]\]$/ {skip=1; next}
  /^\[/{ if(skip==1){skip=0} }
  skip==1{ next }
  { print }
' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"

# append fresh env.production and env.dev D1 bindings at EOF (preferred observation-friendly style)
cat >> "$API_TOML" <<EOF

[[env.production.d1_databases]]
binding = "DB"
database_name = "${DB_NAME}"
database_id = "${D1_UUID}"
migrations_dir = "../../infra/d1/migrations"

[[env.dev.d1_databases]]
binding = "DB"
database_name = "${DB_NAME}"
database_id = "${D1_UUID}"
migrations_dir = "../../infra/d1/migrations"
EOF

# name (top-level)
sed_in_place "s/^name = \".*\"/name = \"${API_WORKER_NAME}\"/" "$API_TOML"
# ensure [env.production] exists and set name
if ! grep -q "^\[env.production\]" "$API_TOML"; then
  printf "\n[env.production]\n" >> "$API_TOML"
fi
awk -v apiname="$API_WORKER_NAME" '
  BEGIN{inprod=0; hasname=0}
  /^\[env.production\]/{inprod=1; print; next}
  /^\[/{if(inprod==1){if(hasname==0){print "name = \"" apiname "\""} inprod=0; hasname=0}; print; next}
  inprod==1{
    if($0 ~ /^name = "/){ sub(/name = \".*\"/, "name = \"" apiname "\"", $0); hasname=1 }
    print; next
  }
  {print}
  END{ if(inprod==1 && hasname==0){ print "name = \"" apiname "\"" } }
' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"

# d1 production bindings
awk -v dbname="$DB_NAME" -v dbuuid="$D1_UUID" '
  BEGIN{inprod=0; ind1=0}
  /^\[env.production\]/{inprod=1; print; next}
  /^\[/{if(inprod==1 && $0 !~ /^\[env.production\]/){inprod=0}; print; next}
  inprod==1 && /^\[\[env.production.d1_databases\]\]/{ind1=1; print; next}
  ind1==1{
    if($0 ~ /database_name = /){ sub(/database_name = \".*\"/, "database_name = \"" dbname "\"", $0) }
    if($0 ~ /database_id = /){ sub(/database_id = \".*\"/, "database_id = \"" dbuuid "\"", $0) }
    print; next
  }
  {print}
' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"

# ensure top-level [[d1_databases]] exists and is updated
if grep -q '^\[\[d1_databases\]\]' "$API_TOML"; then
  awk -v dbname="$DB_NAME" -v dbuuid="$D1_UUID" '
    BEGIN{ind1=0}
    /^\[\[d1_databases\]\]/{ind1=1; print; next}
    /^\[/{if(ind1==1){ind1=0}; print; next}
    ind1==1{
      if($0 ~ /database_name = /){ sub(/database_name = \".*\"/, "database_name = \"" dbname "\"", $0) }
      if($0 ~ /database_id = /){ sub(/database_id = \".*\"/, "database_id = \"" dbuuid "\"", $0) }
      print; next
    }
    {print}
  ' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"
else
  cat >> "$API_TOML" <<EOF

[[d1_databases]]
binding = "DB"
database_name = "${DB_NAME}"
database_id = "${D1_UUID}"
EOF
fi

# r2 production binding: add/update or remove
if [[ $USE_R2 -eq 1 ]]; then
  # ensure block exists; if exists, update bucket_name; else append a block
  if grep -q "\[\[env.production.r2_buckets\]\]" "$API_TOML"; then
    awk -v r2name="$R2_NAME" '
      BEGIN{inprod=0; inr2=0}
      /^\[env.production\]/{inprod=1; print; next}
      /^\[/{if(inprod==1 && $0 !~ /^\[env.production\]/){inprod=0}; if(inr2==1){inr2=0}; print; next}
      inprod==1 && /^\[\[env.production.r2_buckets\]\]/{inr2=1; print; next}
      inr2==1{
        if($0 ~ /bucket_name = /){ sub(/bucket_name = \".*\"/, "bucket_name = \"" r2name "\"", $0) }
        print; next
      }
      {print}
    ' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"
  else
    cat >> "$API_TOML" <<EOF

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "${R2_NAME}"
EOF
  fi
else
  # remove r2 block in production if present
  awk '
    BEGIN{inprod=0; skipper=0}
    /^\[env.production\]/{inprod=1; print; next}
    /^\[/{ if(inprod==1 && $0 !~ /^\[env.production\]/){inprod=0}; if(skipper==1){skipper=0}; print; next}
    inprod==1 && /^\[\[env.production.r2_buckets\]\]/{skipper=1; next}
    skipper==1{
      # skip until we hit next section or blank line followed by section
      next
    }
    {print}
  ' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"
  # also remove any top-level [[r2_buckets]] blocks to avoid legacy leftovers
  awk '
    BEGIN{skip=0}
    /^\[\[r2_buckets\]\]/{skip=1; next}
    /^\[/{ if(skip==1){skip=0} }
    skip==1{ next }
    { print }
  ' "$API_TOML" > "$API_TOML.tmp" && mv "$API_TOML.tmp" "$API_TOML"
fi

# set JWT_SECRET in production vars (create var if missing)
if grep -q "^\[env.production.vars\]" "$API_TOML"; then
  # update existing JWT_SECRET or append
  if grep -q "^JWT_SECRET" "$API_TOML"; then
    sed_in_place "s/^JWT_SECRET = \".*\"/JWT_SECRET = \"${JWT_SECRET}\"/" "$API_TOML"
  else
    awk -v secret="$JWT_SECRET" '
      BEGIN{inprodvars=0}
      /^\[env.production.vars\]/{inprodvars=1; print; next}
      /^\[/{if(inprodvars==1){inprodvars=0}; print; next}
      inprodvars==1{ print; next }
      {print}
      END{ }
    ' "$API_TOML" > "$API_TOML.tmp"
    # Append inside vars block (simple approach: append at end)
    echo "JWT_SECRET = \"${JWT_SECRET}\"" >> "$API_TOML.tmp"
    mv "$API_TOML.tmp" "$API_TOML"
  fi
else
  cat >> "$API_TOML" <<EOF

[env.production.vars]
JWT_SECRET = "${JWT_SECRET}"
EOF
fi

# --- Update frontend wrangler.json ---
WEB_JSON="$WEB_DIR/wrangler.json"
if [[ ! -f "$WEB_JSON" && -f "$WEB_DIR/wrangler.json.example" ]]; then
  cp "$WEB_DIR/wrangler.json.example" "$WEB_JSON"
fi
if [[ ! -f "$WEB_JSON" ]]; then
  echo "[ERROR] Frontend wrangler.json not found" >&2
  exit 1
fi

# set names and service binding at top-level fields
export WEB_WORKER_NAME
json_edit "$WEB_JSON" '.name = env.WEB_WORKER_NAME'
export API_WORKER_NAME
# Ensure services array exists and set first binding/service
json_edit "$WEB_JSON" '.services = ( .services // [] )'
json_edit "$WEB_JSON" '.services[0].binding = "API"'
json_edit "$WEB_JSON" '.services[0].service = env.API_WORKER_NAME'
# ensure env.production exists and set name
json_edit "$WEB_JSON" '.env = ( .env // {} )'
json_edit "$WEB_JSON" '.env.production = ( .env.production // {} )'
json_edit "$WEB_JSON" '.env.production.name = env.WEB_WORKER_NAME'
## also ensure production services binding points to the new API worker
json_edit "$WEB_JSON" '.env.production.services = ( .env.production.services // [] )'
json_edit "$WEB_JSON" '.env.production.services[0].binding = "API"'
json_edit "$WEB_JSON" '.env.production.services[0].service = env.API_WORKER_NAME'
## ensure dev environment exists and also points to new API worker
json_edit "$WEB_JSON" '.env.dev = ( .env.dev // {} )'
json_edit "$WEB_JSON" '.env.dev.name = env.WEB_WORKER_NAME'
json_edit "$WEB_JSON" '.env.dev.services = ( .env.dev.services // [] )'
json_edit "$WEB_JSON" '.env.dev.services[0].binding = "API"'
json_edit "$WEB_JSON" '.env.dev.services[0].service = env.API_WORKER_NAME'

# --- Install & build ---
cd "$ROOT_DIR"
echo "\n==> npm install"
npm install

echo "\n==> npm run build"
npm run build

# --- Bootstrap D1 schema (remote) ---
if [[ -f "$BOOTSTRAP_SQL" ]]; then
  echo "\n==> Bootstrap D1 schema (users, media)"
  ( cd "$API_DIR" && cf_wrangler d1 execute "$DB_NAME" --remote --env=production --file="$BOOTSTRAP_SQL" ) || true
else
  echo "\n[INFO] No bootstrap SQL found: $BOOTSTRAP_SQL (skipping)"
fi

# --- Apply D1 migrations (remote, optional) ---
if [[ "$SKIP_MIGRATIONS" != "1" ]]; then
  if [[ -d "$MIGRATIONS_DIR" ]]; then
    echo "\n==> Preparing migrations directory for API"
    # Sync migrations into apps/api/migrations so wrangler can detect them by default
    rm -rf "$API_DIR/migrations"
    mkdir -p "$API_DIR/migrations"
    rsync -a "$MIGRATIONS_DIR/" "$API_DIR/migrations/"
    echo "\n==> Apply D1 migrations (remote)"
    ( cd "$API_DIR" && cf_wrangler d1 migrations apply "$DB_NAME" --remote --env=production ) || true
  else
    echo "\n[INFO] No migrations directory found: $MIGRATIONS_DIR (skipping)"
  fi
else
  echo "\n[INFO] SKIP_MIGRATIONS=$SKIP_MIGRATIONS (skipping migrations)"
fi

# --- Deploy backend ---
echo "\n==> Deploy backend (${API_WORKER_NAME})"
DEPLOY_LOG=$(mktemp)
( cd "$API_DIR" && cf_wrangler deploy --env=production | tee "$DEPLOY_LOG" ) || true
BACKEND_URL=$(cat "$DEPLOY_LOG" | extract_workers_url)
rm -f "$DEPLOY_LOG"
if [[ -z "$BACKEND_URL" ]]; then
  BACKEND_URL="https://${API_WORKER_NAME}.workers.dev"
fi

echo "Backend URL: $BACKEND_URL"

# Set API_BASE_URL in frontend vars (top-level)
export BACKEND_URL
json_edit "$WEB_JSON" '.vars.API_BASE_URL = env.BACKEND_URL'
## and ensure production.env vars override with the same URL (avoid legacy leftovers)
json_edit "$WEB_JSON" '.env.production.vars = ( .env.production.vars // {} )'
json_edit "$WEB_JSON" '.env.production.vars.API_BASE_URL = env.BACKEND_URL'
## and ensure dev.env vars also use the same URL to avoid stale legacy values
json_edit "$WEB_JSON" '.env.dev.vars = ( .env.dev.vars // {} )'
json_edit "$WEB_JSON" '.env.dev.vars.API_BASE_URL = env.BACKEND_URL'

# --- Deploy frontend ---
echo "\n==> Deploy frontend (${WEB_WORKER_NAME})"
FRONT_DEPLOY_LOG=$(mktemp)
( cd "$WEB_DIR" && cf_wrangler deploy --env=production | tee "$FRONT_DEPLOY_LOG" ) || true
FRONTEND_URL=$(cat "$FRONT_DEPLOY_LOG" | extract_workers_url)
rm -f "$FRONT_DEPLOY_LOG"
if [[ -z "$FRONTEND_URL" ]]; then
  FRONTEND_URL="https://${WEB_WORKER_NAME}.workers.dev"
fi

echo "\n==> Done"
echo "Project:           ${PROJECT_NAME}"
echo "Backend Worker:    ${API_WORKER_NAME}"
echo "Frontend Worker:   ${WEB_WORKER_NAME}"
echo "D1 Name/UUID:      ${DB_NAME} / ${D1_UUID}"
echo "R2 Bucket:         (not created)"
echo "Backend URL:       ${BACKEND_URL}"
echo "Frontend URL:      ${FRONTEND_URL}"
echo "JWT_SECRET (hash): $(echo "$JWT_SECRET" | sed 's/\(......\).*/\1.../')"
