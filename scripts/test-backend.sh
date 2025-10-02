#!/bin/bash
# Test backend services

set -e

echo "======================================"
echo "⚙️  Testing Backend Services"
echo "======================================"
echo ""

cd backend

echo "Running Jest tests with coverage..."
npm run test:coverage

echo ""
echo "✅ Backend tests completed successfully!"

