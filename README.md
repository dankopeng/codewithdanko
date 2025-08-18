# CodeWithDanko 🚀

A modern, production-ready fullstack template built with Remix. Skip the boilerplate and start building your next great project today!

[![Frontend](https://img.shields.io/badge/Frontend-Remix-blue)](https://remix.run)
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

<!-- Deployment steps were removed as this project no longer uses built-in CI/CD or deployment guides. -->

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
```

## 🔗 Links

- [GitHub](https://github.com/dankopeng/codewithdanko)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>© 2025 DANKO AI LIMITED. Built with ❤️ for developers.</p>
  <p>⭐ Star this repo if it helped you!</p>
</div>
