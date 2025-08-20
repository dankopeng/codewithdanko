# CodeWithDanko 🚀

A modern, production-ready fullstack template built with cutting‑edge technologies. Skip the boilerplate and start building your next great project today!

[![Deploy Status](https://img.shields.io/badge/Deploy-Success-brightgreen)](https://codewithdanko.tidepeng.workers.dev)
[![Frontend](https://img.shields.io/badge/Frontend-Remix-blue)](https://remix.run)
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Monorepo-purple)](https://turbo.build)

## ✨ What is CodeWithDanko?

CodeWithDanko is a comprehensive fullstack template that combines the best modern web technologies into a single, cohesive development experience. Whether you're building a SaaS application, e‑commerce site, or content platform, this template provides the foundation you need to move fast and build great products.

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
│   ├── web/               # Remix frontend (deployed as a Worker)
│   └── api/               # Cloudflare Workers API backend
├── packages/
│   ├── ui/                # Shared UI components
│   └── config/            # Shared configuration
├── infra/                 # Infra (D1 bootstrap.sql & migrations)
└── scripts/               # Build & one‑click setup scripts
```

### Tech Stack
- **Frontend**: Remix + React + TypeScript
- **Backend**: Cloudflare Workers + TypeScript
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Storage**: Cloudflare R2 (S3‑compatible, optional)
- **Styling**: Tailwind CSS + shadcn/ui
- **Build System**: Turborepo + Vite
- **Deployment**: Cloudflare Workers (via npm scripts)

### Key Architecture Features
- **Two‑Worker Architecture**: Frontend (Remix) and Backend (API)
- **Service Binding**: Frontend binds backend (`env.API -> <project>-api`), no CORS headache
- **Auth**: End‑to‑end Bearer JWT

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm (workspaces)
- Cloudflare account
- macOS users: `brew install jq` (required by the setup script)

### 1) Clone
```bash
git clone https://github.com/dankopeng/codewithdanko.git your-project
cd your-project
```

### 2) One‑click Setup & Deploy
Prefer the one‑click script for initialization. It asks for a project name, creates D1, executes bootstrap SQL to create base tables, writes JWT, and deploys (migrations optional):
```bash
npm install
npm run setup
```

What the script does:
- Cloudflare login (wrangler@4)
- Create D1 (remote) and write D1 bindings into `apps/api/wrangler.toml` (top-level and `[env.production]`)
- Execute `infra/d1/bootstrap.sql` on remote D1 to create base tables (`users`, `media`)
- Generate `JWT_SECRET` and write it to backend `[env.production].vars`
- Install dependencies and build
- Optionally apply D1 migrations (remote) when `SKIP_MIGRATIONS=0`
- Deploy backend, parse the real workers.dev URL, write frontend `vars.API_BASE_URL`, then deploy frontend
- R2 is optional and disabled by default; when disabled, any legacy R2 bindings are removed from `wrangler.toml`

Environment flags:
- `SKIP_MIGRATIONS=0 npm run setup` to run migrations after bootstrap (default is to skip)

### 3) Manual alternative (optional)
If you prefer not to use the setup script:
```bash
npx wrangler login
npm install
npm run build
npm run deploy
```

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
- **Authentication** - JWT-based auth with OAuth/Bearer tokens
- **Security** - HTTPS, CSP, security headers
- **Scalability** - Serverless architecture that scales automatically

## 🛠️ Available Scripts

```bash
# Development
npm run dev                 # Start all services

# Build & checks
npm run build               # Build all packages
npm run typecheck           # Type check
npm run lint                # Lint

# Deploy
npm run deploy              # Deploy backend then frontend (production)
npm run deploy:dev          # Deploy both to dev env

# One‑click bootstrap
npm run setup               # scripts/setup.sh
```

## 🌍 Deployment

- This template uses npm scripts + Wrangler for manual deployments; pushing to GitHub does not trigger CI/CD.
- You can add your own CI/CD (e.g., GitHub Actions); this repo ships with auto‑deploy disabled by default.

Notes on configuration & security:
- Example configs are provided (e.g., `apps/api/wrangler.toml.example`, `apps/web/wrangler.json.example`).
- The setup script writes environment‑specific IDs (like D1 UUID) locally; do not commit production credentials.

## 📖 Documentation

- `docs/getting-started.md`
- `docs/components.md`
- `docs/api.md`

## 🔗 Links

- [Live Demo](https://codewithdanko.tidepeng.workers.dev)
- [GitHub](https://github.com/dankopeng/codewithdanko)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>© 2025 DANKO AI LIMITED. Built with ❤️ for developers.</p>
  <p>⭐ Star this repo if it helped you!</p>
</div>
