# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing and deployment.

## Available Workflows

### `test.yml` - Comprehensive Testing Pipeline

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Daily scheduled runs at 2 AM UTC

**Jobs:**
1. **Backend Tests** - Runs Jest unit tests with coverage
2. **Smart Contract Tests** - Runs Move unit tests
3. **Build Verification** - Ensures all components build successfully
4. **Integration Tests** - Full end-to-end testing
5. **Code Quality** - Linting and formatting checks

**Coverage:**
- Backend test coverage is automatically uploaded to Codecov
- Smart contract coverage is displayed in test output

## Local Testing

Before pushing, run locally:

```bash
# All tests
npm run test:all

# With build verification
npm run verify:all

# Backend only
npm run test:backend

# Contracts only
npm run test:contracts
```

## Status Badges

Add to your README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/Clob402/workflows/Comprehensive%20Testing/badge.svg)
```

