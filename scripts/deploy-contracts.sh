#!/bin/bash

# Smart Contract Deployment Script
# Deploys Move contracts to Aptos testnet

set -e

echo "🚀 Deploying Move contracts to Aptos testnet..."
echo ""

# Check if aptos CLI is installed
command -v aptos >/dev/null 2>&1 || { 
    echo "❌ Aptos CLI is not installed. Install from: https://aptos.dev/tools/install-cli/"
    exit 1
}

# Check if facilitator profile exists
if ! aptos config show-profiles 2>/dev/null | grep -q "facilitator"; then
    echo "❌ Aptos 'facilitator' profile not found"
    echo "Run: aptos init --profile facilitator --network testnet"
    exit 1
fi

# Get facilitator address
FACILITATOR_ADDRESS=$(aptos config show-profiles 2>/dev/null | grep -A 5 "facilitator" | grep "account" | awk '{print $2}')
echo "📍 Facilitator address: $FACILITATOR_ADDRESS"
echo ""

# Change to move directory
cd move

# Compile contracts
echo "🔨 Compiling Move contracts..."
aptos move compile --named-addresses clob_strategy_vault=$FACILITATOR_ADDRESS
echo "✅ Compilation successful"
echo ""

# Run tests
echo "🧪 Running tests..."
aptos move test
echo "✅ Tests passed"
echo ""

# Deploy contracts
echo "📤 Publishing contracts to testnet..."
aptos move publish \
    --profile facilitator \
    --named-addresses clob_strategy_vault=$FACILITATOR_ADDRESS \
    --assume-yes

echo ""
echo "✅ Contracts deployed successfully!"
echo ""

# Initialize contracts
echo "🔧 Initializing contracts..."
echo ""

echo "Initializing OrderBook..."
aptos move run \
    --function-id "${FACILITATOR_ADDRESS}::order_book::initialize_order_book" \
    --profile facilitator \
    --assume-yes

echo ""
echo "Initializing StrategyVault..."
aptos move run \
    --function-id "${FACILITATOR_ADDRESS}::strategy_vault::initialize_vault" \
    --args address:$FACILITATOR_ADDRESS \
    --profile facilitator \
    --assume-yes

echo ""
echo "Initializing NonceStore..."
aptos move run \
    --function-id "${FACILITATOR_ADDRESS}::payment_with_auth::initialize_nonce_store" \
    --profile facilitator \
    --assume-yes

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Save these addresses for your .env files:"
echo "MODULE_ADDRESS=$FACILITATOR_ADDRESS"
echo "ORDER_BOOK_ADDRESS=$FACILITATOR_ADDRESS"
echo "VAULT_ADDRESS=$FACILITATOR_ADDRESS"
echo ""
echo "🌐 View on Explorer: https://explorer.aptoslabs.com/account/$FACILITATOR_ADDRESS?network=testnet"

