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

# npx will pull wrangler from devDependencies if present
if ! npx wrangler --version >/dev/null 2>&1; then
  echo "[ERROR] wrangler not available via npx. Run: npm i -D wrangler" >&2
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

# --- R2 disabled by default (storage-agnostic template) ---
USE_R2=0

# --- Cloudflare login ---
echo "\n==> Cloudflare login (a browser window may open)"
npx wrangler login || true

# --- Create D1 DB ---
echo "\n==> Creating D1 database: ${DB_NAME}"
# Try JSON output first; if unsupported, fall back to plain text parsing
set +e
D1_OUTPUT=$(npx wrangler d1 create "${DB_NAME}" --json 2>/dev/null)
if [[ $? -ne 0 || -z "$D1_OUTPUT" ]]; then
  D1_OUTPUT=$(npx wrangler d1 create "${DB_NAME}" 2>&1)
fi
set -e

# Attempt to parse JSON; if not JSON, extract UUID via regex
D1_UUID=$(echo "$D1_OUTPUT" | jq -r '.uuid // .database_uuid // empty' 2>/dev/null || true)
if [[ -z "$D1_UUID" || "$D1_UUID" == "null" ]]; then
  D1_UUID=$(echo "$D1_OUTPUT" | grep -Eo '[0-9a-fA-F-]{36}' | head -n 1 || true)
fi

D1_OUT_NAME=$(echo "$D1_OUTPUT" | jq -r '.name // empty' 2>/dev/null || true)
if [[ -z "$D1_OUT_NAME" || "$D1_OUT_NAME" == "null" ]]; then
  # Try to find a line like "Created.* <name>" or fallback to DB_NAME
  D1_OUT_NAME=$(echo "$D1_OUTPUT" | grep -Eo "${DB_NAME}" | head -n 1 || true)
  D1_OUT_NAME=${D1_OUT_NAME:-$DB_NAME}
fi

if [[ -z "$D1_UUID" ]]; then
  echo "[ERROR] Failed to parse D1 UUID from wrangler output:" >&2
  echo "$D1_OUTPUT" >&2
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

# name
sed_in_place "s/^name = \".*\"/name = \"${API_WORKER_NAME}\"/" "$API_TOML"
# env.production name
awk '
  BEGIN{block=0}
  /^\[env.production\]/{block=1; print; next}
  /^\[/{if(block==1){block=0}; print; next}
  block==1{ if($0 ~ /^name = \\"/){ sub(/name = \".*\"/, "name = \"'"${API_WORKER_NAME}"'\"", $0) } ; print; next }
  {print}
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

# --- Install & build ---
cd "$ROOT_DIR"
echo "\n==> npm install"
npm install

echo "\n==> npm run build"
npm run build

# --- Apply D1 migrations (remote) ---
if [[ -d "$MIGRATIONS_DIR" ]]; then
  echo "\n==> Preparing migrations directory for API"
  # Sync migrations into apps/api/migrations so wrangler can detect them by default
  rm -rf "$API_DIR/migrations"
  mkdir -p "$API_DIR/migrations"
  cp -R "$MIGRATIONS_DIR/"* "$API_DIR/migrations/" 2>/dev/null || true
  echo "\n==> Applying D1 migrations (remote) to ${DB_NAME}"
  ( cd "$API_DIR" && npx wrangler d1 migrations apply "$DB_NAME" --remote ) || true
else
  echo "\n[INFO] No migrations directory found: $MIGRATIONS_DIR (skipping)"
fi

# --- Deploy backend ---
echo "\n==> Deploy backend (${API_WORKER_NAME})"
BACKEND_URL=$(npm run -s deploy:backend 2>&1 | extract_workers_url || true)
if [[ -z "$BACKEND_URL" ]]; then
  # fallback: try to construct
  BACKEND_URL="https://${API_WORKER_NAME}.workers.dev"
fi

echo "Backend URL: $BACKEND_URL"

# Set API_BASE_URL in frontend vars (top-level)
export BACKEND_URL
json_edit "$WEB_JSON" '.vars.API_BASE_URL = env.BACKEND_URL'

# --- Deploy frontend ---
echo "\n==> Deploy frontend (${WEB_WORKER_NAME})"
FRONTEND_URL=$(npm run -s deploy:frontend 2>&1 | extract_workers_url || true)
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
