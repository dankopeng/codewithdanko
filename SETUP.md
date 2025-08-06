# CodeWithDanko Setup Guide

This guide will help you set up your own instance of CodeWithDanko with Cloudflare Workers, D1, and R2.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) package manager
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Quick Setup

Run the automated setup script:

```bash
./scripts/setup.sh
```

This will copy the template configuration files. Then follow the manual steps below.

## Manual Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Cloudflare

#### Login to Cloudflare
```bash
wrangler login
```

#### Create D1 Databases
```bash
# Production database
wrangler d1 create your-database-name

# Development database  
wrangler d1 create your-database-name-dev
```

#### Create R2 Buckets
```bash
# Production bucket
wrangler r2 bucket create your-media-bucket

# Development bucket
wrangler r2 bucket create your-media-bucket-dev
```

### 3. Configure wrangler.toml

Copy the template and edit with your resource IDs:

```bash
cp packages/backend/wrangler.toml.example packages/backend/wrangler.toml
```

Edit `packages/backend/wrangler.toml` and replace:
- `your-project-api` → your desired project name
- `your_database_name` → your database name
- `your-d1-database-id-here` → actual D1 database ID from step 2
- `your-media-bucket-name` → your R2 bucket name

### 4. Configure wrangler.json

Copy the template and edit:

```bash
cp packages/frontend/wrangler.json.example packages/frontend/wrangler.json
```

Edit `packages/frontend/wrangler.json` and replace:
- `your-project-frontend` → your desired frontend project name

### 5. Run Database Migrations

```bash
cd packages/backend

# Apply to development
wrangler d1 migrations apply --env dev

# Apply to production
wrangler d1 migrations apply --env production
```

### 6. Set Environment Secrets (Optional)

For production, set sensitive environment variables:

```bash
# JWT secret for authentication
wrangler secret put JWT_SECRET --env production
wrangler secret put JWT_SECRET --env dev

# Any other API keys
wrangler secret put API_KEY --env production
```

### 7. Build and Deploy

```bash
# Build the project
npm run build

# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy
```

## Development

### Local Development

```bash
# Start development servers
npm run dev

# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend
```

### Database Management

```bash
# View database content
wrangler d1 execute your-database-name --command "SELECT * FROM users;"

# Run migrations
wrangler d1 migrations apply --env dev
```

### R2 Storage Management

```bash
# List bucket contents
wrangler r2 object list your-media-bucket

# Upload file
wrangler r2 object put your-media-bucket/test.txt --file ./test.txt
```

## Security Notes

⚠️ **Important**: Never commit the actual `wrangler.toml` and `wrangler.json` files to version control. They contain sensitive resource IDs.

- ✅ Commit: `wrangler.toml.example`, `wrangler.json.example`
- ❌ Never commit: `wrangler.toml`, `wrangler.json`

## Troubleshooting

### Common Issues

1. **"Database not found"**
   - Ensure your D1 database ID is correct in `wrangler.toml`
   - Check that migrations have been applied

2. **"Bucket not found"**
   - Verify R2 bucket name in `wrangler.toml`
   - Ensure bucket exists in your Cloudflare account

3. **"Worker not found"**
   - Check project names in configuration files
   - Ensure you're logged into the correct Cloudflare account

### Getting Help

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## Project Structure

```
packages/
├── backend/           # Cloudflare Workers API
│   ├── src/
│   ├── migrations/    # D1 database migrations
│   ├── wrangler.toml.example  # Template configuration
│   └── wrangler.toml  # Your actual configuration (gitignored)
├── frontend/          # Remix application
│   ├── app/
│   ├── wrangler.json.example  # Template configuration
│   └── wrangler.json  # Your actual configuration (gitignored)
└── shared/            # Shared utilities and types
```

## Next Steps

After setup, you can:

1. Customize the UI components in `packages/frontend/app/components/`
2. Add API endpoints in `packages/backend/src/`
3. Modify database schema in `packages/backend/migrations/`
4. Deploy to production with `npm run deploy`

Happy coding! 🚀
