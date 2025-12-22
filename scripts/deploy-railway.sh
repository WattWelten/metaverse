#!/bin/bash
# Railway Deployment Script
# Hilft beim Deployment des Servers auf Railway

set -e

echo "=== Railway Deployment Helper ==="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo ""
    echo "Install with:"
    echo "  npm i -g @railway/cli"
    echo ""
    exit 1
fi

echo "✓ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "⚠ Not logged in to Railway"
    echo "Run: railway login"
    exit 1
fi

echo "✓ Logged in to Railway"
echo ""

# Navigate to server
cd apps/server

echo "=== Deploying to Railway ==="
echo ""

# Initialize if needed
if [ ! -f "railway.json" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "Setting environment variables..."
echo ""
read -p "Enter CLIENT_URL (e.g., https://mvp.wattwelten.de): " CLIENT_URL

railway variables set CLIENT_URL="$CLIENT_URL"
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set LOG_LEVEL=info

echo ""
echo "✓ Environment variables set"
echo ""

# Deploy
echo "Deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure custom domain: realtime.wattwelten.de"
echo "2. Test health check: curl https://realtime.wattwelten.de/health"
echo "3. Update VITE_NET_URL in Vercel with the server URL"

