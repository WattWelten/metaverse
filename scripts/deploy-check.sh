#!/bin/bash
# Deployment Validation Script
# Prüft ob alle notwendigen Environment-Variablen gesetzt sind

set -e

echo "=== Deployment Validation ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓${NC} .env.production exists"
    source .env.production
else
    echo -e "${YELLOW}⚠${NC} .env.production not found (using environment variables)"
fi

# Required Client Variables
CLIENT_VARS=(
    "VITE_TEMPLATE_ID"
    "VITE_MULTIPLAYER_ENABLED"
    "VITE_XR_ENABLED"
    "VITE_DEBUG_ENABLED"
    "VITE_NET_URL"
)

echo ""
echo "=== Client Environment Variables ==="
MISSING_CLIENT=0
for var in "${CLIENT_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} $var is not set"
        MISSING_CLIENT=1
    else
        echo -e "${GREEN}✓${NC} $var=${!var}"
    fi
done

# Required Server Variables
SERVER_VARS=(
    "CLIENT_URL"
    "NODE_ENV"
    "PORT"
)

echo ""
echo "=== Server Environment Variables ==="
MISSING_SERVER=0
for var in "${SERVER_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} $var is not set"
        MISSING_SERVER=1
    else
        echo -e "${GREEN}✓${NC} $var=${!var}"
    fi
done

echo ""
if [ $MISSING_CLIENT -eq 0 ] && [ $MISSING_SERVER -eq 0 ]; then
    echo -e "${GREEN}✓ All required environment variables are set${NC}"
    exit 0
else
    echo -e "${RED}✗ Some required environment variables are missing${NC}"
    echo ""
    echo "See docs/PRODUCTION_ENV.md for required variables"
    exit 1
fi

















