#!/bin/bash
# Comprehensive test script for the entire project

set -e  # Exit on error

echo "======================================"
echo "🧪 Running Comprehensive Test Suite"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo "----------------------------------------"
    echo "Running: ${test_name}"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ ${test_name} FAILED${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# 1. Backend Unit Tests
run_test "Backend Unit Tests" "cd backend && npm test"

# 2. Move Smart Contract Tests
run_test "Smart Contract Tests" "cd move && aptos move test"

# 3. TypeScript Compilation Check (Backend)
run_test "Backend Build" "cd backend && npm run build"

# 4. TypeScript Compilation Check (Frontend)
run_test "Frontend Build" "cd frontend && npm run build"

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix them before deploying.${NC}"
    exit 1
fi

