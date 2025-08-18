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
├── infra/                 # Infra (e.g., D1 migrations)
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
- macOS users: `brew install jq` (腳本需用)

### 1) Clone
```bash
git clone https://github.com/dankopeng/codewithdanko.git your-project
cd your-project
```

### 2) One‑click Setup & Deploy
推薦使用一鍵腳本完成初始化（會互動式詢問專案名、是否建立 R2，並自動創建 D1、寫入 JWT、遷移、部署）：
```bash
npm run setup
```

腳本做的事：
- Cloudflare 登入（wrangler login）
- 建立 D1 遠端實例並寫入 `apps/api/wrangler.toml`
-（可選）建立 R2 並在後端綁定
- 生成 `JWT_SECRET` 並寫入後端 production vars（可後續改為 Wrangler Secret）
- 安裝依賴、Build、套用 D1 遷移（remote）
- 部署後端 → 回填前端 `API_BASE_URL` → 部署前端

### 3) 手動替代路徑（可選）
若不使用一鍵腳本：
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

- 本模板使用 npm 腳本+Wrangler 手動部署，推送到 GitHub 不會觸發 CI/CD。
- 你也可以自行添加 CI/CD 流程（例如 GitHub Actions），本倉庫預設為關閉自動部署。

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
