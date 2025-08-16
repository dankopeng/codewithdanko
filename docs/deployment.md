# Deployment Guide

This guide provides detailed instructions for deploying CodeWithDanko to production environments.

## Deployment Architecture

CodeWithDanko uses a two-Worker architecture:

1. **Frontend Worker** (`codewithdanko`): Serves the Remix application
2. **Backend Worker** (`codewithdanko-api`): Handles API requests

The frontend proxies `/api/*` requests to the backend via a Cloudflare Worker Service Binding.

## Prerequisites

- Cloudflare account with Workers access
- Wrangler CLI installed and authenticated
- Completed local setup as described in [Getting Started](./getting-started.md)

## Environment Setup

### Production Environment Variables

Before deployment, ensure your environment variables are properly configured:

#### Backend (`apps/api/wrangler.toml`)

```toml
name = "codewithdanko-api"

[[d1_databases]]
binding = "DB"
database_name = "codewithdanko-db"
database_id = "YOUR_D1_DATABASE_ID"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "codewithdanko-media"

[vars]
UPLOAD_MAX_BYTES = "52428800"
```

Set your JWT secret:

```bash
cd apps/api
npx wrangler secret put JWT_SECRET
# Enter a strong, random string when prompted
```

#### Frontend (`apps/web/wrangler.json`)

```json
{
  "name": "codewithdanko",
  "compatibility_date": "2023-06-28",
  "service_binding": [
    {
      "name": "API",
      "service": "codewithdanko-api"
    }
  ],
  "vars": {
    "SESSION_MAX_AGE": "604800",
    "UPLOAD_MAX_BYTES": "52428800"
  }
}
```

## Database Migrations

Before deploying, apply any pending database migrations:

```bash
cd apps/api
npx wrangler d1 migrations apply codewithdanko-db
```

## Deployment Commands

### Full Deployment

To deploy both frontend and backend:

```bash
npm run deploy
```

This runs the deployment scripts defined in the root `package.json`.

### Individual Deployments

To deploy components individually:

```bash
# Deploy backend only
npm run deploy:backend

# Deploy frontend only
npm run deploy:frontend
```

### Dry Run Deployments

To test deployments without actually publishing:

```bash
# Dry run both
npm run deploy:dev

# Dry run backend only
npm run deploy:backend:dev

# Dry run frontend only
npm run deploy:frontend:dev
```

## Custom Domain Setup

After deploying, you can bind a custom domain to your frontend Worker:

1. Go to the Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your `codewithdanko` Worker
4. Go to the "Triggers" tab
5. Under "Custom Domains", click "Add Custom Domain"
6. Enter your domain (e.g., `codewithdanko.dankopeng.com`)
7. Follow the instructions to verify and add the domain

## Monitoring and Logs

### Viewing Logs

```bash
# View frontend logs
cd apps/web
npx wrangler tail codewithdanko

# View backend logs
cd apps/api
npx wrangler tail codewithdanko-api
```

### Analytics

Access analytics for your Workers in the Cloudflare Dashboard:

1. Go to Workers & Pages
2. Select your Worker
3. Navigate to the "Analytics" tab

## Advanced Deployment Options

### Staged Deployments

For more complex deployment workflows, you can use environment-specific configurations:

```bash
# Deploy to staging
NODE_ENV=staging npm run deploy

# Deploy to production
NODE_ENV=production npm run deploy
```

This requires setting up environment-specific wrangler configuration files.

### Continuous Integration

You can set up GitHub Actions for automated deployments. Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

You'll need to add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as secrets in your GitHub repository.

## Rollback Procedures

If a deployment causes issues, you can roll back to a previous version:

```bash
# List versions
npx wrangler versions list codewithdanko

# Rollback to a specific version
npx wrangler rollback codewithdanko --version=VERSION_ID
```

## Performance Optimization

### Asset Optimization

Static assets are served from `apps/web/build/client` as configured in `apps/web/wrangler.json`. Ensure your assets are optimized:

- Use appropriate image formats and sizes
- Minify CSS and JavaScript
- Enable Brotli or Gzip compression

### Caching Strategy

Implement proper caching headers for static assets:

```js
// In your Remix app
export function headers() {
  return {
    "Cache-Control": "public, max-age=31536000, immutable"
  };
}
```

## Security Considerations

### Headers

Implement security headers in your application:

```js
// In your Remix app
export function headers() {
  return {
    "Content-Security-Policy": "default-src 'self';",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer-when-downgrade"
  };
}
```

### CORS

Since the frontend proxies API requests via service binding, CORS is not needed for the API. However, if you need to access the API directly from other domains, configure CORS in the backend Worker.

## Troubleshooting

### Common Deployment Issues

1. **Service Binding Errors**:
   - Ensure the backend Worker is deployed before the frontend
   - Verify the service binding name matches in `wrangler.json`

2. **Missing Environment Variables**:
   - Check that all required secrets and vars are set

3. **Database Connection Issues**:
   - Verify D1 database ID is correct
   - Ensure migrations have been applied

4. **Build Failures**:
   - Clear the `.turbo` cache directory
   - Ensure all dependencies are installed

For more help, check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) or open an issue on our [GitHub repository](https://github.com/dankopeng/codewithdanko/issues).
