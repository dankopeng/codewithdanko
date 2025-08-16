# CodeWithDanko 🚀

A modern, production-ready fullstack template built with Remix and Cloudflare Workers. Skip the boilerplate and start building your next great project today!

[![Deploy Status](https://img.shields.io/badge/Deploy-Success-brightgreen)](https://codewithdanko.dankopeng.com)
[![Frontend](https://img.shields.io/badge/Frontend-Remix-blue)](https://remix.run)
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Monorepo-purple)](https://turbo.build)

## ✨ What is CodeWithDanko?

CodeWithDanko is a comprehensive fullstack template that combines Remix and Cloudflare Workers into a single, cohesive development experience. Whether you're building a SaaS application, e-commerce site, or content platform, this template provides the foundation you need to move fast and build great products.

## 🎯 Perfect For

- **SaaS Applications** - User management, subscriptions, dashboards
- **E-commerce Sites** - Product catalogs, shopping carts, payments
- **Content Platforms** - Blogs, documentation sites, CMS
- **Landing Pages** - Marketing sites, product showcases
- **Startup MVPs** - Rapid prototyping and validation

## 🏗️ Architecture

### Monorepo Structure
```
codewithdanko/
├── apps/
│   ├── web/               # Remix frontend application
│   └── api/               # Cloudflare Workers API backend
├── packages/
│   ├── ui/                # Shared UI components
│   └── config/            # Shared configuration
├── infra/                 # Infrastructure code
└── scripts/               # Build and deployment scripts
```

### Tech Stack
- **Frontend**: Remix + React + TypeScript
- **Backend**: Cloudflare Workers + TypeScript
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS + shadcn/ui
- **Build System**: Turborepo
- **Deployment**: Cloudflare Workers

### Key Architecture Features
- **Two Workers Architecture**: Frontend (Remix) and backend (API)
- **Service Binding Proxy**: Frontend proxies `/api/*` to backend via Worker Service Binding (`env.API -> codewithdanko-api`)
- **Auth**: Authorization header Bearer tokens end-to-end (no CORS issues)

## 🚀 Quick Start

### Prerequisites
- Node.js (npm v10+ recommended)
- Cloudflare account

### 1. Clone the Repository
```bash
# Clone the template
git clone https://github.com/dankopeng/codewithdanko.git your-project
cd your-project

# Install dependencies
npm install
```

### 2. Configure Cloudflare Resources
```bash
# Login to Cloudflare
npx wrangler login
```

Edit the configuration files:
- Backend `apps/api/wrangler.toml`:
  - Bind D1: `codewithdanko-db`
  - Bind R2: `codewithdanko-media`
  - Set `JWT_SECRET`
- Frontend `apps/web/wrangler.json`:
  - Service binding `env.API` -> `codewithdanko-api`
  - `SESSION_MAX_AGE=604800` (7 days)


### 3. Development
```bash
# Start development server
npm run dev
```

### 4. Deploy
```bash
# Full deploy (backend + frontend)
npm run deploy

# Dry run (both)
npm run deploy:dev

# Individual deployments
npm run deploy:backend     # Backend only
npm run deploy:frontend    # Frontend only
```

After first deploy, bind custom domain `codewithdanko.dankopeng.com` to the frontend Worker.

## 🌟 Key Features

### 🔧 Developer Experience
- **Hot Reload** - Instant feedback during development
- **Type Safety** - End-to-end TypeScript coverage
- **Monorepo Benefits** - Shared code and unified workflows

### ⚡ Performance
- **Edge Computing** - Deploy globally on Cloudflare's network
- **Server-Side Rendering** - Fast initial page loads
- **CDN Integration** - Static assets served from the edge

### 🎨 UI/UX
- **Modern Design System** - Built with shadcn/ui components
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Support** - Automatic theme switching

### 🔐 Production Ready
- **Authentication** - JWT-based auth with Bearer tokens
- **Security** - HTTPS, secure headers
- **Scalability** - Serverless architecture that scales automatically

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start all services

# Building
npm run build            # Build all packages

# Deployment
npm run deploy           # Deploy to production
npm run deploy:backend   # Deploy backend only
npm run deploy:frontend  # Deploy frontend only
npm run deploy:dev       # Dry run deployment
npm run deploy:dev:backend   # Deploy backend only
npm run deploy:dev:frontend  # Deploy frontend only    
```

## 🌍 Deployment

### Cloudflare Workers
This template is optimized for Cloudflare Workers deployment:

1. **Automatic Scaling** - Handle any traffic load
2. **Global Edge Network** - Sub-100ms response times worldwide
3. **Zero Cold Starts** - Always-on performance
4. **Cost Effective** - Pay only for what you use

### Deployment Notes
- Frontend static assets are served from `apps/web/build/client` as configured in `apps/web/wrangler.json`
- Production-only deployment for now
- API base URL is provided via service binding, not CORS

## 🔗 Links

- [Live Demo](https://codewithdanko.dankopeng.com)
- [GitHub](https://github.com/dankopeng/codewithdanko)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>© 2025 DANKO AI LIMITED. Built with ❤️ for developers.</p>
  <p>⭐ Star this repo if it helped you!</p>
</div>
