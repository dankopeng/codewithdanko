# Getting Started with CodeWithDanko

This guide will walk you through setting up and running your first CodeWithDanko project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher (comes with Node.js)
- **Cloudflare account**: Required for deployments
- (macOS) **jq**: `brew install jq` (required by the setup script)

## Installation

1) Clone the repository:

```bash
git clone https://github.com/dankopeng/codewithdanko.git your-project-name
cd your-project-name
```

2) Install dependencies:

```bash
npm install
```

## Setup & Configuration

### Recommended: One‑click automated setup

Use the provided script to initialize and deploy. It will interactively ask for a project name (e.g., `myapp`).

```bash
npm run setup
```

The script will:
- Log in to Cloudflare (`npx wrangler login`)
- Create a D1 database (`<project>-db`) and write bindings/IDs into `apps/api/wrangler.toml`
- Generate a random `JWT_SECRET` and write it into backend production vars
- Install deps, build the monorepo, and apply D1 migrations (remote)
- Deploy backend → detect its URL → write `API_BASE_URL` into frontend → deploy frontend

Afterwards, you will have two workers deployed:
- Backend: `<project>-api`
- Frontend: `<project>`

### Manual alternative (if not using the script)

1. Login to Cloudflare using Wrangler:

```bash
npx wrangler login
```

2. Create Cloudflare resources as needed:

- D1 Database:
```bash
npx wrangler d1 create <project>-db
```

> Optional storage integrations (e.g., Cloudflare R2) are not required for most users and are omitted here. You can add them later following a separate storage guide.

3. Update configs:

- Backend `apps/api/wrangler.toml`:
  - `name` → `<project>-api`
  - `[[env.production.d1_databases]]` → `database_name=<project>-db`, set `database_id` (from the `d1 create` output)
  - In `[env.production.vars]`, set `JWT_SECRET` to a strong random string

- Frontend `apps/web/wrangler.json`:
  - `name` → `<project>`
  - `service_binding[0].service` → `<project>-api`
  - `vars.API_BASE_URL` → "https://<project>-api.<your-account>.workers.dev" (or custom domain if configured)

## Development

Start the development server:

```bash
npm run dev
```

This will start both the frontend and backend in development mode. The frontend will be available at `http://localhost:8788`.

## Database Migrations

Run migrations against the remote D1 instance (the setup script already does this):

```bash
npx wrangler d1 migrations apply <project>-db --remote
```

## Deployment

Deploy both frontend and backend:

```bash
npm run deploy
```

Or deploy them individually:

```bash
npm run deploy:backend
npm run deploy:frontend
```

After deployment, you can bind a custom domain to your frontend Worker in the Cloudflare dashboard.

## Next Steps

- Check out the [API documentation](./api.md) to learn about available endpoints
- Explore the [component library](./components.md) to build your UI
- Read the [deployment guide](./deployment.md) for advanced deployment options

## Troubleshooting

### Common Issues

1. **Wrangler Authentication Errors**:
   - Run `npx wrangler login` again to refresh your authentication

2. **Missing Bindings**:
   - Ensure all bindings in wrangler.toml/json match your Cloudflare resource names

3. **Build Errors**:
   - Check Node.js version compatibility
   - Clear the .turbo cache directory and try again

For more help, open an issue on our [GitHub repository](https://github.com/dankopeng/codewithdanko/issues).
