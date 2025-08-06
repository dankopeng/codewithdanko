#!/bin/bash

# 設置模板項目的腳本

echo "🚀 開始設置項目模板..."

# 創建模板目錄結構
mkdir -p template/{packages/{frontend,backend,shared},scripts,docs,.github/workflows,config}

echo "📁 創建模板目錄結構完成"

# 複製當前項目文件到模板目錄
echo "📋 複製項目文件到模板..."

# 複製 packages
cp -r packages/* template/packages/

# 複製根配置文件並重命名為模板文件
cp package.json template/package.json.template
cp turbo.json template/turbo.json.template
cp pnpm-workspace.yaml template/pnpm-workspace.yaml.template

# 創建 README 模板
cat > template/README.md.template << 'EOF'
# {{PROJECT_DISPLAY_NAME}}

{{PROJECT_DESCRIPTION}}

## 🚀 快速開始

### 前置要求

- Node.js >= 20.0.0
- pnpm
- Cloudflare 賬戶

### 安裝依賴

```bash
pnpm install
```

### 本地開發

```bash
# 啟動所有服務
pnpm dev

# 只啟動前端
pnpm dev:frontend

# 只啟動後端
pnpm dev:backend
```

### 構建項目

```bash
pnpm build
```

### 部署

```bash
# 部署到生產環境
pnpm deploy

# 部署到開發環境
pnpm deploy:dev
```

## 🏗️ 項目架構

- **Frontend**: Remix + React + TypeScript
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Workers

## 📚 文檔

- [API 文檔](./docs/api.md)
- [部署指南](./docs/deployment.md)
- [開發指南](./docs/development.md)

## 👨‍💻 作者

**{{AUTHOR_NAME}}**
- Email: {{AUTHOR_EMAIL}}
- Website: {{AUTHOR_WEBSITE}}

## 📄 許可證

MIT License
EOF

# 創建 GitHub Actions 工作流模板
mkdir -p template/.github/workflows
cat > template/.github/workflows/deploy.yml.template << 'EOF'
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Development
        if: github.ref == 'refs/heads/develop'
        run: pnpm deploy:dev
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
EOF

# 創建環境變量模板
cat > template/.env.example.template << 'EOF'
# 項目配置
PROJECT_NAME={{PROJECT_NAME}}
ENVIRONMENT=development

# Cloudflare 配置
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# 數據庫配置
DATABASE_ID={{DATABASE_ID}}
DATABASE_NAME={{DATABASE_NAME}}

# Stripe 配置 (如果啟用)
STRIPE_PUBLIC_KEY={{STRIPE_PUBLIC_KEY}}
STRIPE_SECRET_KEY={{STRIPE_SECRET_KEY}}
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Google OAuth 配置 (如果啟用)
GOOGLE_CLIENT_ID={{GOOGLE_CLIENT_ID}}
GOOGLE_CLIENT_SECRET={{GOOGLE_CLIENT_SECRET}}

# 郵件服務配置 (如果啟用)
RESEND_API_KEY={{RESEND_API_KEY}}

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key
EOF

# 創建部署配置模板
mkdir -p template/config
cat > template/config/wrangler.toml.template << 'EOF'
name = "{{PROJECT_NAME}}-frontend"
main = "build/index.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[[d1_databases]]
binding = "DB"
database_name = "{{DATABASE_NAME}}"
database_id = "{{DATABASE_ID}}"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "{{PROJECT_NAME}}-media"

[env.development]
name = "{{PROJECT_NAME}}-dev"

[env.development.vars]
ENVIRONMENT = "development"

[env.production]
name = "{{PROJECT_NAME}}"

[env.production.vars]
ENVIRONMENT = "production"
EOF

# 創建文檔模板
mkdir -p template/docs
cat > template/docs/getting-started.md.template << 'EOF'
# {{PROJECT_DISPLAY_NAME}} - 快速開始

## 概述

{{PROJECT_DESCRIPTION}}

## 環境設置

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 配置環境變量

複製 `.env.example` 為 `.env` 並填寫相應的配置：

```bash
cp .env.example .env
```

### 3. 設置 Cloudflare

1. 創建 Cloudflare D1 數據庫
2. 創建 R2 存儲桶
3. 獲取 API Token

### 4. 本地開發

```bash
pnpm dev
```

## 項目結構

```
{{PROJECT_NAME}}/
├── packages/
│   ├── frontend/    # Remix 前端應用
│   ├── backend/     # Cloudflare Workers API
│   └── shared/      # 共享代碼和類型
├── docs/            # 項目文檔
└── scripts/         # 工具腳本
```

## 下一步

- [API 文檔](./api.md)
- [部署指南](./deployment.md)
- [開發指南](./development.md)
EOF

echo "✅ 模板設置完成！"
echo ""
echo "下一步："
echo "1. 檢查 template/ 目錄中的文件"
echo "2. 根據需要調整模板內容"
echo "3. 測試項目創建腳本：node create-project.js test-project"