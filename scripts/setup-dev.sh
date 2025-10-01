#!/bin/bash

# Development Setup Script for x402 CLOB on Aptos
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Setting up x402 CLOB + Strategy Vault on Aptos..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is not installed${NC}"; exit 1; }
command -v aptos >/dev/null 2>&1 || { echo -e "${RED}❌ Aptos CLI is not installed. Install from: https://aptos.dev/tools/install-cli/${NC}"; exit 1; }

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

cd ..

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Created backend/.env - Please update with your values${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo -e "${YELLOW}⚠️  Created frontend/.env.local - Please update with your values${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.local already exists${NC}"
fi

echo ""

# Check Aptos profile
echo "🔑 Checking Aptos configuration..."
if aptos config show-profiles 2>/dev/null | grep -q "facilitator"; then
    echo -e "${GREEN}✅ Aptos 'facilitator' profile found${NC}"
else
    echo -e "${YELLOW}⚠️  Aptos 'facilitator' profile not found${NC}"
    echo "Run: aptos init --profile facilitator --network testnet"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your facilitator private key"
echo "2. Configure frontend/.env.local with backend URL and addresses"
echo "3. Deploy Move contracts: cd move && aptos move publish --profile facilitator"
echo "4. Initialize contracts (see SETUP.md for commands)"
echo "5. Start backend: npm run dev:backend"
echo "6. Start frontend: npm run dev:frontend"
echo ""
echo "📚 For detailed instructions, see SETUP.md"

