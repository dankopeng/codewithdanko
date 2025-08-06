#!/bin/bash

echo "🚀 Setting up CodeWithDanko Cloudflare configuration..."
echo ""

# Create packages/backend/wrangler.toml from template
if [ ! -f "packages/backend/wrangler.toml" ]; then
    if [ -f "packages/backend/wrangler.toml.example" ]; then
        cp packages/backend/wrangler.toml.example packages/backend/wrangler.toml
        echo "✅ Created packages/backend/wrangler.toml from template"
    else
        echo "❌ Template file packages/backend/wrangler.toml.example not found"
        exit 1
    fi
else
    echo "⚠️  packages/backend/wrangler.toml already exists, skipping..."
fi

# Create packages/frontend/wrangler.json from template
if [ ! -f "packages/frontend/wrangler.json" ]; then
    if [ -f "packages/frontend/wrangler.json.example" ]; then
        cp packages/frontend/wrangler.json.example packages/frontend/wrangler.json
        echo "✅ Created packages/frontend/wrangler.json from template"
    else
        echo "❌ Template file packages/frontend/wrangler.json.example not found"
        exit 1
    fi
else
    echo "⚠️  packages/frontend/wrangler.json already exists, skipping..."
fi

echo ""
echo "🔧 Next steps:"
echo "1. Create your Cloudflare D1 databases:"
echo "   wrangler d1 create your-database-name"
echo "   wrangler d1 create your-database-name-dev"
echo ""
echo "2. Create your Cloudflare R2 buckets:"
echo "   wrangler r2 bucket create your-media-bucket"
echo "   wrangler r2 bucket create your-media-bucket-dev"
echo ""
echo "3. Edit the following files with your actual resource IDs:"
echo "   - packages/backend/wrangler.toml"
echo "   - packages/frontend/wrangler.json"
echo ""
echo "4. Run database migrations:"
echo "   cd packages/backend"
echo "   wrangler d1 migrations apply --env dev"
echo "   wrangler d1 migrations apply --env production"
echo ""
echo "5. Deploy your application:"
echo "   npm run deploy:dev"
echo "   npm run deploy"
echo ""
echo "📚 For detailed setup instructions, see SETUP.md"
