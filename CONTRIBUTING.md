# Contributing to x402-Style CLOB + Strategy Vault

Thank you for your interest in contributing to our project! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for improvements
- 📝 **Improve documentation** - Help make our docs better
- 🔧 **Submit code changes** - Fix bugs or implement features
- 🧪 **Write tests** - Increase test coverage
- 🎨 **Improve UI/UX** - Make the interface more intuitive
- 🔐 **Security audits** - Help identify vulnerabilities

## 📋 Before You Start

### Prerequisites

- Node.js 18 or higher
- Aptos CLI installed
- Basic understanding of Move, TypeScript, and React
- Familiarity with Git and GitHub

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Clob402.git
cd Clob402

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Clob402.git
```

### 2. Set Up Development Environment

```bash
# Run automated setup
./scripts/setup-dev.sh

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

## 📝 Development Guidelines

### Move Smart Contracts

**Location**: `move/sources/`

**Guidelines**:
- Follow Move best practices and idioms
- Add comprehensive inline comments
- Write unit tests for all public functions
- Use descriptive variable and function names
- Ensure gas efficiency
- Document all error codes

**Testing**:
```bash
cd move
aptos move test
aptos move compile
```

**Example**:
```move
/// Transfer tokens with authorization
/// This function verifies signature and executes transfer atomically
/// 
/// @param facilitator - The account submitting the transaction
/// @param sender - The user authorizing the payment
/// @param amount - Amount to transfer
/// @return void
public entry fun transfer_with_authorization(
    facilitator: &signer,
    sender: address,
    amount: u64,
) {
    // Implementation
}
```

### Backend (Node.js/TypeScript)

**Location**: `backend/src/`

**Guidelines**:
- Use TypeScript strict mode
- Follow RESTful API conventions
- Add JSDoc comments for functions
- Use async/await over callbacks
- Implement proper error handling
- Add request validation
- Write integration tests

**Code Style**:
```typescript
/**
 * Submit a sponsored payment authorization transaction
 * @param authMessage - The payment authorization message
 * @param signature - User's Ed25519 signature
 * @param publicKey - User's public key
 * @returns Transaction hash
 */
export async function submitSponsoredPaymentAuth(
  authMessage: PaymentAuthMessage,
  signature: string,
  publicKey: string
): Promise<string> {
  try {
    // Implementation
  } catch (error) {
    logger.error('Error submitting sponsored payment:', error);
    throw error;
  }
}
```

**Testing**:
```bash
cd backend
npm run test
npm run lint
```

### Frontend (Next.js/React)

**Location**: `frontend/src/`

**Guidelines**:
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Add loading states for async operations
- Ensure accessibility (ARIA labels)
- Make components responsive
- Use shadcn/ui components when available

**Component Example**:
```typescript
interface OrderFormProps {
  onOrderPlaced?: (orderId: string) => void;
}

export function OrderForm({ onOrderPlaced }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Implementation
  
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

**Testing**:
```bash
cd frontend
npm run lint
npm run build
```

## 🧪 Testing Requirements

### Smart Contracts
- Unit tests for all public functions
- Test error conditions
- Test edge cases (overflow, underflow, etc.)

### Backend
- Unit tests for services
- Integration tests for API endpoints
- Test error handling
- Mock external dependencies

### Frontend
- Component tests (future enhancement)
- E2E tests for critical flows (future enhancement)

## 📖 Documentation

### Code Comments
- Use clear, concise comments
- Explain **why**, not just **what**
- Document assumptions and limitations
- Add JSDoc/TSDoc for public APIs

### Documentation Files
- Update README.md if adding features
- Update SETUP.md for setup changes
- Update ARCHITECTURE.md for structural changes
- Add examples for new features

## 🔍 Code Review Process

### Before Submitting

1. **Test your changes**
   ```bash
   # Run tests
   cd move && aptos move test
   cd backend && npm run test
   cd frontend && npm run lint
   ```

2. **Update documentation**
   - Update relevant .md files
   - Add code comments
   - Update CHANGELOG if applicable

3. **Commit messages**
   Follow conventional commits:
   ```
   feat: add new order type support
   fix: resolve nonce replay issue
   docs: update API documentation
   test: add vault share calculation tests
   refactor: optimize order matching logic
   ```

4. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Submitting Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request reviewers

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   How was this tested?
   
   ## Screenshots
   (if applicable)
   
   ## Checklist
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] Code follows style guidelines
   - [ ] No new warnings
   ```

### Review Criteria

Your PR will be reviewed for:

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation completeness
- ✅ Performance implications
- ✅ Security considerations
- ✅ Breaking changes (if any)

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try to reproduce on latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS 14.0]
- Node version: [e.g. 18.0.0]
- Browser: [e.g. Chrome 120]
- Network: [testnet/mainnet]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives considered**
Alternative solutions or features

**Additional context**
Mockups, examples, etc.
```

## 🔐 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to: [security@yourproject.com]
2. Include detailed description
3. Provide steps to reproduce
4. Wait for response before disclosure

### Security Review Checklist

- [ ] No private keys in code
- [ ] Input validation implemented
- [ ] Rate limiting in place
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure random number generation

## 📜 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
export async function getUserOrders(
  userAddress: string
): Promise<Order[]> {
  if (!userAddress) {
    throw new Error('User address is required');
  }
  
  return await orderService.getOrders(userAddress);
}

// ❌ Bad
export function getUserOrders(addr) {
  return orderService.getOrders(addr);
}
```

### Move

```move
// ✅ Good
/// Validates and executes a payment authorization
/// Throws E_NONCE_ALREADY_USED if nonce was previously used
public entry fun transfer_with_authorization(
    facilitator: &signer,
    sender: address,
    amount: u64,
) {
    assert!(!is_nonce_used(nonce), E_NONCE_ALREADY_USED);
    // Implementation
}

// ❌ Bad
public entry fun transfer(s: &signer, a: address, amt: u64) {
    // No comments, unclear parameter names
}
```

### React/JSX

```tsx
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ onClick, disabled, children }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-label="Submit order"
    >
      {children}
    </Button>
  );
}

// ❌ Bad
export function Btn(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

## 🎯 Priority Areas

We especially welcome contributions in:

- 🔒 **Security audits** - Review smart contracts and backend
- 🧪 **Test coverage** - Increase test coverage to 80%+
- 📱 **Mobile responsiveness** - Improve mobile experience
- 🌐 **Internationalization** - Add multi-language support
- 📊 **Analytics** - Add trading analytics dashboard
- ⚡ **Performance** - Optimize order matching and UI rendering
- 🔌 **Integrations** - Add more wallet support

## 📞 Getting Help

- 💬 **Discord**: Join our community server
- 🐦 **Twitter**: Follow for updates
- 📧 **Email**: contact@yourproject.com
- 📖 **Documentation**: Check SETUP.md and ARCHITECTURE.md

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit messages
- Invited to contributor channels

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make DeFi on Aptos better! 🚀

**Questions?** Open a discussion on GitHub or join our Discord.

