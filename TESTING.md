# Testing Guide

This document outlines the testing infrastructure and procedures for the Clob402 project.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Smart Contract Testing](#smart-contract-testing)
- [Running Tests](#running-tests)
- [Continuous Integration](#continuous-integration)
- [Coverage Reports](#coverage-reports)

## Overview

The project uses a comprehensive testing approach covering:
- **Backend Unit Tests**: Jest-based tests for TypeScript services and routes
- **Smart Contract Tests**: Move unit tests for on-chain logic
- **Integration Tests**: End-to-end testing of backend APIs
- **Build Verification**: Ensures all components compile successfully

## Backend Testing

### Technology Stack
- **Test Framework**: Jest
- **Assertion Library**: Jest matchers
- **HTTP Testing**: Supertest
- **Coverage**: Istanbul (built into Jest)

### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test configuration
├── services/
│   ├── aptosService.test.ts   # Aptos SDK integration tests
│   └── nonceService.test.ts   # Nonce management tests
└── routes/
    └── paymentAuth.test.ts    # Payment auth API tests
```

### Running Backend Tests

```bash
# Run all tests
cd backend && npm test

# Run with coverage
cd backend && npm run test:coverage

# Run in watch mode (for development)
cd backend && npm run test:watch
```

### Writing Backend Tests

Example test structure:

```typescript
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('functionName', () => {
    it('should handle valid input', () => {
      // Test implementation
    });

    it('should reject invalid input', () => {
      // Test implementation
    });
  });
});
```

## Smart Contract Testing

### Technology Stack
- **Test Framework**: Aptos Move Test Framework
- **Language**: Move

### Test Structure

```
move/tests/
└── order_book_test.move        # Order book functionality tests
```

### Running Smart Contract Tests

```bash
# Run Move tests
cd move && aptos move test

# Run with coverage
cd move && aptos move test --coverage

# Compile contracts
cd move && aptos move compile
```

### Test Coverage

The Move tests cover:
- ✅ Order placement (bid/ask)
- ✅ Order cancellation
- ✅ Order filling (partial/complete)
- ✅ Authorization checks
- ✅ Input validation
- ✅ Edge cases

## Running Tests

### Quick Test Commands

From the project root:

```bash
# Run all tests (backend + smart contracts)
npm run test:all

# Run only backend tests
npm run test:backend

# Run only smart contract tests
npm run test:contracts

# Run backend tests with coverage
npm run test:coverage

# Verify builds
npm run verify:build

# Run all tests + build verification
npm run verify:all
```

### Using Test Scripts

The project includes helper scripts in the `scripts/` directory:

```bash
# Comprehensive test suite
./scripts/test-all.sh

# Backend tests only
./scripts/test-backend.sh

# Smart contracts only
./scripts/test-contracts.sh
```

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## Continuous Integration

### GitHub Actions Workflows

The project uses GitHub Actions for automated testing:

**Workflow: `.github/workflows/test.yml`**

Runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Daily at 2 AM UTC (scheduled)

Jobs:
1. **Backend Tests**: Runs Jest tests with coverage
2. **Smart Contract Tests**: Runs Move tests
3. **Build Verification**: Ensures frontend and backend build
4. **Integration Tests**: Runs full test suite
5. **Code Quality**: Linting and formatting checks

### CI Test Commands

```bash
# Install dependencies
npm ci

# Run CI test suite
npm run test:all

# Verify builds
npm run verify:build
```

## Coverage Reports

### Backend Coverage

Coverage reports are generated in `backend/coverage/`:
- `lcov.info`: Raw coverage data
- `html/index.html`: HTML report (open in browser)
- `text-summary`: Console output

View coverage:
```bash
cd backend
npm run test:coverage
open coverage/html/index.html
```

### Smart Contract Coverage

Move test coverage is displayed in console output after running:
```bash
cd move
aptos move test --coverage
```

## Best Practices

### Test Organization
- Group related tests with `describe` blocks
- Use descriptive test names with `it` or `test`
- Keep tests focused on single functionality
- Mock external dependencies

### Test Data
- Use consistent test addresses and values
- Avoid hardcoding magic numbers
- Create helper functions for common test data

### Assertions
- Test both success and failure cases
- Verify error messages and codes
- Check all relevant fields in responses

### Mocking
- Mock external services (Aptos SDK calls)
- Use `jest.mock()` for module mocks
- Clear mocks between tests with `jest.clearAllMocks()`

## Regular Testing Schedule

For production-ready code:

1. **Before each commit**: Run `npm run test:backend`
2. **Before each PR**: Run `npm run test:all`
3. **Before deployment**: Run `npm run verify:all`
4. **Daily**: CI runs full test suite automatically
5. **Weekly**: Review coverage reports and add missing tests

## Debugging Tests

### Backend Tests
```bash
# Run specific test file
cd backend
npx jest src/__tests__/services/aptosService.test.ts

# Run tests matching pattern
npx jest --testNamePattern="verify signature"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Move Tests
```bash
# Run with verbose output
cd move
aptos move test --verbose

# Test specific module
aptos move test --filter order_book_tests
```

## Adding New Tests

### For Backend Features
1. Create test file: `backend/src/__tests__/[category]/[name].test.ts`
2. Import dependencies and module to test
3. Mock external dependencies
4. Write test cases with setup/teardown
5. Run tests to verify: `npm test`

### For Smart Contracts
1. Create test file: `move/tests/[module]_test.move`
2. Use `#[test_only]` module annotation
3. Write test functions with `#[test]` attribute
4. Use `#[expected_failure]` for error cases
5. Run tests: `aptos move test`

## Troubleshooting

### Common Issues

**Jest timeout errors:**
```typescript
// Increase timeout in setup.ts
jest.setTimeout(30000); // 30 seconds
```

**Mock not working:**
```typescript
// Ensure mock is before import
jest.mock('../services/aptosService');
import { aptosService } from '../services/aptosService';
```

**Move test failures:**
```bash
# Clean and rebuild
cd move
aptos move clean
aptos move test
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Aptos Move Testing](https://aptos.dev/move/move-on-aptos/testing/)
- [Move Book - Unit Tests](https://move-language.github.io/move/unit-testing.html)

---

**Note**: Keep this document updated as testing infrastructure evolves.

