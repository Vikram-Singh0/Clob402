#!/bin/bash
# Test Move smart contracts

set -e

echo "======================================"
echo "🔗 Testing Move Smart Contracts"
echo "======================================"
echo ""

cd move

echo "Running Move unit tests..."
aptos move test --coverage

echo ""
echo "✅ Smart contract tests completed successfully!"

