# Getting Started with CodeWithDanko

This guide will walk you through setting up and running your first CodeWithDanko project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 10.0.0 or higher (comes with Node.js)
- **A Cloudflare account**: You'll need this to deploy your application

## Installation

1. Clone the repository:

```bash
git clone https://github.com/dankopeng/codewithdanko.git your-project-name
cd your-project-name
```

2. Install dependencies:

```bash
npm install
```

## Configuration

### Cloudflare Setup

1. Login to Cloudflare using Wrangler:

```bash
npx wrangler login
```

2. Create the necessary Cloudflare resources:

   - **D1 Database**: Create a database named `codewithdanko-db`
   ```bash
   npx wrangler d1 create codewithdanko-db
   ```

   - **R2 Storage**: Create a bucket named `codewithdanko-media`
   ```bash
   npx wrangler r2 bucket create codewithdanko-media
   ```

### Backend Configuration

Edit `apps/api/wrangler.toml` with your Cloudflare resource bindings:

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

### Frontend Configuration

Edit `apps/web/wrangler.json` with your service bindings:

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

## Development

Start the development server:

```bash
npm run dev
```

This will start both the frontend and backend in development mode. The frontend will be available at `http://localhost:8788`.

## Database Migrations

Initialize and run migrations:

```bash
cd apps/api
npx wrangler d1 migrations apply codewithdanko-db
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
