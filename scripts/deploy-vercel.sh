#!/bin/bash
# Vercel Deployment Script
# Hilft beim Deployment des Web Clients auf Vercel

set -e

echo "=== Vercel Deployment Helper ==="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo ""
    echo "Install with:"
    echo "  npm i -g vercel"
    echo ""
    exit 1
fi

echo "✓ Vercel CLI found"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠ Not logged in to Vercel"
    echo "Run: vercel login"
    exit 1
fi

echo "✓ Logged in to Vercel"
echo ""

# Navigate to web app
cd apps/web

echo "=== Deploying to Vercel ==="
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel Dashboard:"
echo "   - VITE_TEMPLATE_ID=watt-eco"
echo "   - VITE_MULTIPLAYER_ENABLED=true"
echo "   - VITE_XR_ENABLED=true"
echo "   - VITE_DEBUG_ENABLED=false"
echo "   - VITE_NET_URL=https://realtime.wattwelten.de (after server deployment)"
echo ""
echo "2. Configure custom domain: mvp.wattwelten.de"
echo "3. Redeploy after setting VITE_NET_URL"

