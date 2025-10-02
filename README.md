# x402-Style CLOB + Strategy Vault on Aptos

A gasless, composable DeFi trading platform combining a Centralized Limit Order Book (CLOB) with copy-trading strategy vaults using x402-style payment authorization on Aptos blockchain.

## 🌟 Features

- **Gasless Trading**: Sponsored transactions eliminate gas fees for users
- **x402 Payment Flow**: Off-chain signature authorization for secure, UX-friendly payments
- **Limit Order Book**: On-chain CLOB for efficient price-time priority matching
- **Strategy Vaults**: Copy-trading vaults that mirror reference trader positions
- **Native USDC**: Leverages Aptos's native USDC for seamless integration
- **Modern UI**: Clean, responsive interface with dark mode support

## 🏗️ Architecture

### Smart Contracts (Move)

- **PaymentWithAuth**: Validates signed payment intents with nonce replay protection
- **OrderBook**: Manages limit orders with price-time priority
- **StrategyVault**: Handles deposits, shares, and copy-trading mechanics

### Backend (Node.js + TypeScript)

- **Facilitator Service**: Verifies signatures and submits sponsored transactions
- **API Endpoints**: REST API for orders, vaults, and payment authorization
- **Nonce Management**: Prevents replay attacks with efficient caching

### Frontend (Next.js 14 + React)

- **Wallet Integration**: Supports Petra, Martian, and other Aptos wallets
- **Trading Interface**: Real-time order book and intuitive order placement
- **Vault Dashboard**: Manage deposits, withdrawals, and track performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Aptos CLI
- An Aptos wallet (Petra or Martian)

### 1. Smart Contract Setup

```bash
cd move

# Initialize Aptos account (if needed)
aptos init --network testnet

# Compile Move modules
aptos move compile

# Deploy contracts
aptos move publish --named-addresses clob_strategy_vault=YOUR_ADDRESS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your facilitator private key and contract addresses

# Run backend
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your backend URL and contract addresses

# Run frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📝 User Flow

### Trading Flow

1. **Connect Wallet**: User connects Aptos wallet (Petra/Martian)
2. **View Order Book**: Browse live APT/USDC order book
3. **Place Order**: Submit limit buy/sell order
4. **Payment Authorization**:
   - Backend returns HTTP 402 with payment intent
   - User signs authorization off-chain
   - Facilitator submits sponsored transaction
5. **Order Execution**: Order placed on-chain with zero gas fees

### Vault Flow

1. **Deposit**: User deposits USDC into strategy vault
2. **Receive Shares**: Vault mints proportional shares
3. **Copy-Trading**: Vault mirrors reference trader's orders
4. **Withdraw**: User redeems shares for proportional USDC value

## 🔐 Security Features

- **Nonce-based Replay Protection**: Each authorization uses a unique nonce
- **Expiry Timestamps**: Payment intents expire after 5 minutes
- **Domain Separation**: Signed messages include domain separator
- **On-chain Validation**: Move contracts verify all signatures
- **Rate Limiting**: Backend enforces request limits per IP

## 🛠️ Development

### Project Structure

```
Clob402/
├── move/                    # Move smart contracts
│   ├── sources/
│   │   ├── payment_with_auth.move
│   │   ├── order_book.move
│   │   └── strategy_vault.move
│   └── Move.toml
├── backend/                 # Facilitator backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── package.json
└── frontend/               # Next.js frontend
    ├── src/
    │   ├── app/           # Pages
    │   ├── components/    # React components
    │   └── lib/          # Utilities
    └── package.json
```

### API Endpoints

#### Payment Authorization

- `POST /api/auth/request-intent` - Request payment intent (returns 402)
- `POST /api/auth/submit-authorization` - Submit signed authorization

#### Order Book

- `POST /api/orders/place` - Place limit order
- `POST /api/orders/cancel` - Cancel order
- `GET /api/orders/user/:address` - Get user orders
- `GET /api/orders/order/:orderId` - Get order details

#### Strategy Vault

- `POST /api/vault/deposit` - Deposit into vault
- `POST /api/vault/withdraw` - Withdraw from vault
- `GET /api/vault/shares/:address` - Get user shares
- `GET /api/vault/info` - Get vault information

### Testing

We have comprehensive testing infrastructure covering backend services, smart contracts, and build verification.

#### Quick Test Commands

```bash
# Run all tests (backend + smart contracts)
npm run test:all

# Run backend tests only
npm run test:backend

# Run smart contract tests only
npm run test:contracts

# Run backend tests with coverage report
npm run test:coverage

# Verify all builds
npm run verify:build

# Run all tests + build verification
npm run verify:all
```

#### Test Scripts

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Run comprehensive test suite with reporting
./scripts/test-all.sh

# Run backend tests with coverage
./scripts/test-backend.sh

# Run smart contract tests
./scripts/test-contracts.sh
```

#### Test Coverage

- **Backend Unit Tests**: Services, routes, and utilities (Jest)
- **Smart Contract Tests**: Order book, payment auth, vault logic (Move)
- **Integration Tests**: API endpoints and health checks
- **Build Tests**: TypeScript compilation and production builds

For detailed testing documentation, see [TESTING.md](./TESTING.md)

#### Continuous Integration

Tests run automatically on:

- Every push to `main` or `develop`
- All pull requests
- Daily scheduled runs (2 AM UTC)

View test results in the [Actions tab](../../actions)

## 🌐 Deployment

### Testnet Deployment

1. Deploy Move contracts to Aptos testnet
2. Configure backend with contract addresses
3. Deploy backend to your preferred hosting (Railway, Render, etc.)
4. Deploy frontend to Vercel/Netlify
5. Update frontend environment with backend URL

### Mainnet Considerations

- Audit smart contracts thoroughly
- Implement comprehensive monitoring
- Set up proper key management for facilitator account
- Configure production-grade Redis for nonce tracking
- Enable HTTPS and security headers
- Implement proper logging and alerting

## 📊 Smart Contract Functions

### PaymentWithAuth

```move
public entry fun transfer_with_authorization<CoinType>(
    facilitator: &signer,
    sender: address,
    recipient: address,
    amount: u64,
    nonce: u64,
    expiry: u64,
    signature: vector<u8>,
    public_key: vector<u8>
)
```

### OrderBook

```move
public entry fun place_order(
    user: &signer,
    order_book_addr: address,
    price: u64,
    quantity: u64,
    side: u8  // 0 = bid, 1 = ask
)
```

### StrategyVault

```move
public entry fun deposit<CoinType>(
    user: &signer,
    vault_addr: address,
    amount: u64
)

public entry fun withdraw<CoinType>(
    user: &signer,
    vault_addr: address,
    shares: u64
)
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Aptos Documentation](https://aptos.dev)
- [Move Language](https://move-language.github.io/move/)
- [Aptos TypeScript SDK](https://github.com/aptos-labs/aptos-ts-sdk)
- [x402 Payment Standard](https://github.com/x402)

## 💬 Support

For questions and support:

- Open an issue on GitHub
- Join our Discord community
- Check documentation at docs/

## ⚠️ Disclaimer

This is an MVP for demonstration purposes. Conduct thorough audits and testing before using in production with real funds.

---

Built with ❤️ on Aptos
