# CodeWithDanko 🚀

A modern, production-ready fullstack template built with cutting-edge technologies. Skip the boilerplate and start building your next great project today!

[![Deploy Status](https://img.shields.io/badge/Deploy-Success-brightgreen)](https://codewithdanko.tidepeng.workers.dev)
[![Frontend](https://img.shields.io/badge/Frontend-Remix-blue)](https://remix.run)
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Monorepo-purple)](https://turbo.build)

## ✨ What is CodeWithDanko?

CodeWithDanko is a comprehensive fullstack template that combines the best modern web technologies into a single, cohesive development experience. Whether you're building a SaaS application, e-commerce site, or content platform, this template provides the foundation you need to move fast and build great products.

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
├── packages/
│   ├── frontend/           # Remix application
│   ├── backend/            # Cloudflare Workers API
│   └── shared/             # Shared types and utilities
├── docs/                   # Documentation
└── scripts/                # Build and deployment scripts
```

### Tech Stack
- **Frontend**: Remix + React + TypeScript
- **Backend**: Cloudflare Workers + TypeScript
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Styling**: Tailwind CSS + shadcn/ui
- **Build System**: Turborepo + Vite
- **Deployment**: Cloudflare Workers

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm (workspaces)
- Cloudflare account

### 1. Clone the Repository
```bash
# Clone the template
git clone https://github.com/dankopeng/codewithdanko.git your-project
cd your-project

# Install dependencies
npm install
```

### 2. Setup Cloudflare Resources
```bash
# Run the automated setup script
./scripts/setup.sh

# Or manually copy configuration templates
cp packages/backend/wrangler.toml.example packages/backend/wrangler.toml
cp packages/frontend/wrangler.json.example packages/frontend/wrangler.json
```

### 3. Configure Your Resources
Edit the configuration files with your Cloudflare resource names/IDs and bindings:
- `packages/backend/wrangler.toml` (D1 binding `DB`, R2 binding `R2`)
- `packages/frontend/wrangler.json`

Set secrets via Wrangler (do not put secrets in `[vars]`):
```bash
cd packages/backend
wrangler secret put JWT_SECRET
wrangler secret put OAUTH_GITHUB_CLIENT_ID
wrangler secret put OAUTH_GITHUB_CLIENT_SECRET
# add other OAUTH_* as needed
```

📚 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### 4. Deploy
```bash
# Build and deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy
```

## 🌟 Key Features

### 🔧 Developer Experience
- **Hot Reload** - Instant feedback during development
- **Type Safety** - End-to-end TypeScript coverage
- **Modern Tooling** - ESLint, Prettier, and more
- **Monorepo Benefits** - Shared code and unified workflows

### ⚡ Performance
- **Edge Computing** - Deploy globally on Cloudflare's network
- **Server-Side Rendering** - Fast initial page loads
- **Optimized Builds** - Code splitting and tree shaking
- **CDN Integration** - Static assets served from the edge

### 🎨 UI/UX
- **Modern Design System** - Built with shadcn/ui components
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Support** - Automatic theme switching
- **Accessibility First** - WCAG 2.1 compliant

### 🔐 Production Ready
- **Authentication** - JWT-based auth with OAuth support
- **Security** - HTTPS, CSP, and security headers
- **Monitoring** - Built-in analytics and error tracking
- **Scalability** - Serverless architecture that scales automatically

## 📖 Documentation

- [Getting Started](./docs/getting-started.md)
- [Development Guide](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)
- [API Reference](./docs/api.md)
- [Component Library](./docs/components.md)

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build all packages
npm run typecheck        # Type checking
npm run lint             # Code linting

# Deployment
npm run deploy           # Deploy to production
npm run deploy:dev       # Deploy to development
```

## 🌍 Deployment

### Cloudflare Workers
This template is optimized for Cloudflare Workers deployment:

1. **Automatic Scaling** - Handle any traffic load
2. **Global Edge Network** - Sub-100ms response times worldwide
3. **Zero Cold Starts** - Always-on performance
4. **Cost Effective** - Pay only for what you use

### CI/CD Pipeline
Includes GitHub Actions workflows for:
- Automated testing
- Type checking and linting
- Deployment to staging and production
- Database migrations

## 🎨 Customization

### Styling
- Modify `tailwind.config.ts` for custom design tokens
- Update components in `packages/frontend/app/components/`
- Use the built-in theme system for consistent styling

### Backend
- Add new API routes in `packages/backend/src/routes/`
- Extend database schema in `packages/backend/migrations/`
- Implement new middleware in `packages/backend/src/middleware/`

### Shared Code
- Add common types in `packages/shared/src/types/`
- Create utility functions in `packages/shared/src/utils/`
- Define constants in `packages/shared/src/constants/`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📊 Performance Metrics

- **Lighthouse Score**: 100/100
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Core Web Vitals**: All green

## 🔗 Links

- [Live Demo](https://codewithdanko.dankopeng.com)
- [Documentation](https://docs.codewithdanko.com)
- [GitHub](https://github.com/dankopeng/codewithdanko)
- [Issues](https://github.com/dankopeng/codewithdanko/issues)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with love by developers, for developers. Special thanks to:
- [Remix](https://remix.run) team for the amazing framework
- [Cloudflare](https://cloudflare.com) for the edge platform
- [shadcn](https://ui.shadcn.com) for the beautiful UI components
- The open source community for inspiration and contributions

---

## 🚀 Ready to Build Something Amazing?

```bash
git clone https://github.com/dankopeng/codewithdanko.git your-project
cd your-project
npm run dev
```

**Start building the future, today!** ⭐

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/dankopeng">DankoPeng</a></p>
  <p>⭐ Star this repo if it helped you!</p>
</div>