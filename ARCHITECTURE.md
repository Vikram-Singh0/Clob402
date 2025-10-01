# Architecture Documentation

## System Overview

The x402-style CLOB + Strategy Vault on Aptos is a three-tier architecture combining on-chain smart contracts, an off-chain facilitator backend, and a user-facing frontend.

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────┐
│   Backend   │
│ Facilitator │
└──────┬──────┘
       │ Aptos SDK
       ▼
┌─────────────┐
│   Aptos     │
│ Blockchain  │
└─────────────┘
```

## Component Architecture

### 1. Smart Contracts Layer (Move)

#### PaymentWithAuth Module

**Purpose**: Validates signed payment authorizations and executes transfers atomically.

**Key Components**:
- `NonceStore`: Resource tracking used nonces per user
- `transfer_with_authorization()`: Main entry function
- `construct_authorization_message()`: Builds message for signing

**Security Features**:
- Ed25519 signature verification
- Nonce-based replay protection
- Expiry timestamp validation
- Domain-separated messages

**Flow**:
1. Verify authorization hasn't expired
2. Check nonce hasn't been used
3. Verify cryptographic signature
4. Mark nonce as used
5. Execute token transfer
6. Emit payment event

#### OrderBook Module

**Purpose**: Manages limit orders with price-time priority.

**Key Components**:
- `Order`: Struct representing a single order
- `OrderBook`: Resource containing all orders
- Order management functions (place, cancel, fill)

**Data Structures**:
```move
struct Order {
    order_id: u64,
    owner: address,
    price: u64,
    quantity: u64,
    filled_quantity: u64,
    side: u8,  // 0 = bid, 1 = ask
    status: u8,
    timestamp: u64,
}
```

**Features**:
- Price-time priority ordering
- Partial fills support
- Order status tracking
- User order indexing

#### StrategyVault Module

**Purpose**: Manages copy-trading vault with share-based accounting.

**Key Components**:
- `Vault`: Resource tracking deposits and shares
- Share minting/burning logic
- Copy-trading mechanics

**Share Calculation**:
```
shares_to_mint = (deposit_amount * total_shares) / total_deposits

// For first deposit:
shares_to_mint = deposit_amount (1:1 ratio)
```

**Features**:
- Proportional share system
- Reference trader tracking
- Automatic trade mirroring
- Fair withdrawal calculation

### 2. Backend Facilitator Layer (Node.js)

#### Core Services

**AptosService** (`services/aptosService.ts`)
- Aptos client initialization
- Transaction building and submission
- Signature verification
- On-chain view calls

**NonceService** (`services/nonceService.ts`)
- Nonce generation
- Nonce validation
- In-memory cache
- Replay attack prevention

#### API Routes

**PaymentAuth Routes** (`routes/paymentAuth.ts`)

`POST /api/auth/request-intent`
- Generate payment intent
- Return HTTP 402 with details
- Create fresh nonce and expiry

Response:
```json
{
  "paymentRequired": true,
  "intent": {
    "sender": "0x...",
    "recipient": "0x...",
    "amount": 1000,
    "nonce": 1234567890,
    "expiry": 1234567890,
    "asset": "APT",
    "network": "testnet"
  }
}
```

`POST /api/auth/submit-authorization`
- Verify signature
- Check nonce validity
- Submit sponsored transaction
- Return transaction hash

**OrderBook Routes** (`routes/orderBook.ts`)
- Place orders
- Cancel orders
- Query user orders
- Get order details

**Vault Routes** (`routes/vault.ts`)
- Handle deposits
- Process withdrawals
- Query user shares
- Get vault info

#### Transaction Flow

```
User Request
    ↓
Validate Input
    ↓
Generate Nonce
    ↓
Return 402
    ↓
User Signs
    ↓
Verify Signature
    ↓
Check Nonce
    ↓
Build Transaction
    ↓
Sign as Facilitator
    ↓
Submit to Aptos
    ↓
Wait for Confirmation
    ↓
Return Success/Failure
```

### 3. Frontend Layer (Next.js + React)

#### Component Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page with tabs
│   └── globals.css         # Global styles
├── components/
│   ├── navbar.tsx          # Wallet connection
│   ├── order-book.tsx      # Order book display
│   ├── order-form.tsx      # Trading interface
│   ├── vault-dashboard.tsx # Vault management
│   ├── theme-provider.tsx  # Dark mode
│   ├── wallet-provider.tsx # Wallet adapter
│   └── ui/                 # shadcn/ui components
└── lib/
    └── utils.ts            # Utilities
```

#### Key Features

**Wallet Integration**
- Aptos Wallet Adapter
- Multi-wallet support (Petra, Martian)
- Auto-connect
- Transaction signing

**Order Placement Flow**
```typescript
1. User enters order details
2. Request payment intent from backend
3. Receive HTTP 402
4. Construct message from intent
5. Sign with wallet
6. Submit signed auth to backend
7. Backend submits sponsored tx
8. Display success/error
```

**State Management**
- React hooks for local state
- Wallet state from adapter
- API calls for blockchain data
- Real-time updates on events

#### UI/UX Patterns

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme toggle with system preference
- **Loading States**: Clear feedback during transactions
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML, ARIA labels

## Data Flow

### Place Order Flow

```
┌─────────┐     1. Enter Order     ┌──────────┐
│  User   │ ───────────────────────▶│ Frontend │
└─────────┘                         └─────┬────┘
                                          │
                                   2. POST /request-intent
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ Backend  │
                                    └─────┬────┘
                                          │
                                   3. Return 402
                                          │
                                          ▼
┌─────────┐     4. Sign Auth       ┌──────────┐
│  User   │ ◀───────────────────────│ Frontend │
└─────────┘                         └─────┬────┘
    │                                     │
    │ 5. Signature                        │
    │                                     │
    └─────────────────────────────────────▶
                                          │
                                   6. POST /submit-authorization
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ Backend  │
                                    └─────┬────┘
                                          │
                              7. Sponsored Transaction
                                          │
                                          ▼
                                    ┌──────────┐
                                    │  Aptos   │
                                    │Blockchain│
                                    └─────┬────┘
                                          │
                                    8. Confirmation
                                          │
                                          ▼
┌─────────┐     9. Success         ┌──────────┐
│  User   │ ◀───────────────────────│ Frontend │
└─────────┘                         └──────────┘
```

### Vault Deposit Flow

```
User → Frontend: Deposit Request
Frontend → Backend: Request Intent
Backend → Frontend: HTTP 402
Frontend → User: Sign Request
User → Frontend: Signature
Frontend → Backend: Submit Auth
Backend → Aptos: Sponsored TX (payment_with_auth)
Backend → Aptos: Deposit TX (vault::deposit)
Aptos → Backend: Confirmation
Backend → Frontend: Success + Shares
Frontend → User: Updated Balance
```

## Security Architecture

### Cryptographic Guarantees

1. **Ed25519 Signatures**
   - 256-bit security level
   - Fast verification on-chain
   - Standard Aptos signature scheme

2. **Message Construction**
   ```
   message = concat(
     "APTOS_PAYMENT_AUTH",  // Domain separator
     sender_address,
     recipient_address,
     amount,
     nonce,
     expiry
   )
   ```

3. **Nonce Management**
   - Unique per authorization
   - Timestamp-based generation
   - On-chain storage
   - In-memory cache for performance

### Attack Mitigations

| Attack Vector | Mitigation |
|--------------|------------|
| Replay Attack | Nonce tracking |
| Signature Forgery | Ed25519 verification |
| Front-running | Atomic execution |
| Expired Auth | Timestamp checks |
| Brute Force | Rate limiting |
| DoS | Request limits |

## Performance Considerations

### On-Chain Optimization

- **Parallel Execution**: Aptos's Block-STM enables parallel tx processing
- **Gas Efficiency**: Minimal on-chain storage and computation
- **Event Emission**: Efficient event logging for indexing

### Backend Optimization

- **Nonce Caching**: In-memory cache reduces on-chain calls
- **Connection Pooling**: Reuse Aptos client connections
- **Rate Limiting**: Protect against abuse
- **Async Operations**: Non-blocking I/O

### Frontend Optimization

- **Code Splitting**: Next.js automatic splitting
- **Lazy Loading**: Load components on demand
- **Memoization**: React.memo for expensive renders
- **Optimistic Updates**: Instant UI feedback

## Scalability

### Current Limitations (MVP)

- Single facilitator account (centralization point)
- In-memory nonce cache (not distributed)
- Simple order matching (no matching engine)
- Limited order book depth display

### Production Improvements

1. **Multi-Facilitator Setup**
   - Distribute load across facilitators
   - Fallback mechanisms
   - Load balancing

2. **Distributed Nonce Tracking**
   - Redis cluster for nonce storage
   - Cross-region replication
   - Atomic operations

3. **Advanced Matching Engine**
   - Off-chain order matching
   - Batch settlement on-chain
   - MEV protection

4. **Horizontal Scaling**
   - Containerized backend (Docker)
   - Kubernetes orchestration
   - Auto-scaling based on load

## Monitoring and Observability

### Metrics to Track

- Transaction success rate
- Average confirmation time
- Gas costs per operation
- API response times
- Active users
- Total value locked (TVL)
- Order fill rates

### Logging Strategy

- Structured JSON logs
- Log levels: error, warn, info, debug
- Transaction tracing
- User action tracking
- Performance metrics

### Alerting

- Failed transactions
- High error rates
- API downtime
- Low facilitator balance
- Abnormal activity patterns

## Future Enhancements

1. **WebSocket Integration**: Real-time order book updates
2. **Advanced Order Types**: Stop-loss, take-profit, iceberg
3. **Multiple Trading Pairs**: Beyond APT/USDC
4. **Vault Strategies**: Multiple strategy types
5. **Analytics Dashboard**: Trading history, P&L tracking
6. **Mobile App**: Native iOS/Android apps
7. **Liquidity Mining**: Incentivize market makers
8. **Governance**: Decentralized protocol governance

---

This architecture provides a solid foundation for a production-ready DeFi trading platform on Aptos, balancing decentralization, security, and user experience.

