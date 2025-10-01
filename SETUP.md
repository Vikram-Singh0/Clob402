# Setup Guide - x402 CLOB + Strategy Vault on Aptos

This guide walks you through setting up the entire project from scratch for local development and testing.

## Prerequisites

### Required Tools

1. **Aptos CLI**
   ```bash
   # macOS
   brew install aptos
   
   # Or download from: https://aptos.dev/tools/install-cli/
   ```

2. **Node.js 18+**
   ```bash
   # Check version
   node --version
   
   # Install via nvm
   nvm install 18
   nvm use 18
   ```

3. **Aptos Wallet**
   - Install [Petra Wallet](https://petra.app/) browser extension
   - Or [Martian Wallet](https://martianwallet.xyz/)

## Step 1: Initialize Aptos Development Environment

### Create Aptos Accounts

```bash
# Create facilitator account (for backend)
aptos init --profile facilitator --network testnet

# This will create a new account and save to ~/.aptos/config.yaml
# Note the account address and private key
```

### Get Testnet Tokens

```bash
# Fund your facilitator account
aptos account fund-with-faucet --account facilitator --amount 100000000

# Fund your personal wallet via Petra wallet's built-in faucet
# Or use: https://aptoslabs.com/testnet-faucet
```

## Step 2: Deploy Smart Contracts

### Configure Move.toml

```bash
cd move

# Open Move.toml and update the address
# Replace the clob_strategy_vault address with your facilitator address
```

Update `Move.toml`:
```toml
[addresses]
clob_strategy_vault = "YOUR_FACILITATOR_ADDRESS_HERE"
```

### Compile and Deploy

```bash
# Compile contracts
aptos move compile --named-addresses clob_strategy_vault=YOUR_FACILITATOR_ADDRESS

# Test contracts (optional)
aptos move test

# Publish to testnet
aptos move publish \
  --profile facilitator \
  --named-addresses clob_strategy_vault=YOUR_FACILITATOR_ADDRESS \
  --assume-yes
```

**Save the transaction hash** - you'll need it to verify deployment.

### Initialize Contracts

```bash
# Initialize order book
aptos move run \
  --function-id 'YOUR_ADDRESS::order_book::initialize_order_book' \
  --profile facilitator \
  --assume-yes

# Initialize strategy vault (replace REFERENCE_TRADER_ADDRESS)
aptos move run \
  --function-id 'YOUR_ADDRESS::strategy_vault::initialize_vault' \
  --args address:REFERENCE_TRADER_ADDRESS \
  --profile facilitator \
  --assume-yes

# Initialize nonce store for your wallet
aptos move run \
  --function-id 'YOUR_ADDRESS::payment_with_auth::initialize_nonce_store' \
  --profile facilitator \
  --assume-yes
```

## Step 3: Configure Backend

### Install Dependencies

```bash
cd ../backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:

```bash
# Aptos Configuration
APTOS_NETWORK=testnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com

# Facilitator Wallet (from aptos init step)
FACILITATOR_PRIVATE_KEY=0x... # Your facilitator private key
FACILITATOR_ADDRESS=0x... # Your facilitator address

# Smart Contract Addresses (all same as facilitator for MVP)
ORDER_BOOK_ADDRESS=0x... # Your facilitator address
VAULT_ADDRESS=0x... # Your facilitator address  
MODULE_ADDRESS=0x... # Your facilitator address

# Server Configuration
PORT=3001
NODE_ENV=development

# Redis (optional for MVP)
ENABLE_REDIS=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Start Backend Server

```bash
npm run dev
```

Backend should be running at `http://localhost:3001`

Test health endpoint:
```bash
curl http://localhost:3001/health
```

## Step 4: Configure Frontend

### Install Dependencies

```bash
cd ../frontend
npm install
```

### Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MODULE_ADDRESS=0x... # Your facilitator address
NEXT_PUBLIC_ORDER_BOOK_ADDRESS=0x... # Your facilitator address
NEXT_PUBLIC_VAULT_ADDRESS=0x... # Your facilitator address
```

### Start Frontend

```bash
npm run dev
```

Frontend should be running at `http://localhost:3000`

## Step 5: Test the Application

### Connect Wallet

1. Open `http://localhost:3000` in your browser
2. Click "Connect Wallet"
3. Select Petra or Martian wallet
4. Approve connection

### Test Trading Flow

1. Navigate to "Trade" tab
2. Enter price and quantity for a buy order
3. Click "Place Buy Order"
4. Sign the payment authorization in your wallet
5. Wait for transaction confirmation
6. Check order appears in order book

### Test Vault Flow

1. Navigate to "Strategy Vault" tab
2. Enter deposit amount
3. Click "Deposit"
4. Sign transaction in wallet
5. Verify shares received

## Step 6: Verify Everything Works

### Check Smart Contract State

```bash
# View order book orders for your address
aptos move view \
  --function-id 'YOUR_ADDRESS::order_book::get_user_orders' \
  --args address:YOUR_ORDER_BOOK_ADDRESS address:YOUR_WALLET_ADDRESS

# View vault shares
aptos move view \
  --function-id 'YOUR_ADDRESS::strategy_vault::get_user_shares' \
  --args address:YOUR_VAULT_ADDRESS address:YOUR_WALLET_ADDRESS

# View vault info
aptos move view \
  --function-id 'YOUR_ADDRESS::strategy_vault::get_vault_info' \
  --args address:YOUR_VAULT_ADDRESS
```

### Check Backend Logs

Backend should log:
- Wallet connections
- Payment intent requests (HTTP 402)
- Signature verifications
- Transaction submissions
- Success/failure status

### Check Frontend Console

Browser console should show:
- Wallet connection events
- API requests/responses
- Transaction hashes
- Any errors

## Troubleshooting

### Common Issues

**1. "Module not found" error when deploying**
- Ensure `Move.toml` has correct address
- Check you're using the right profile
- Verify address format (include `0x` prefix)

**2. "Insufficient balance" errors**
- Fund your facilitator account from faucet
- Ensure you have enough APT for gas

**3. Wallet connection fails**
- Clear browser cache
- Reinstall wallet extension
- Try different wallet (Petra vs Martian)

**4. Backend can't submit transactions**
- Verify `FACILITATOR_PRIVATE_KEY` in `.env`
- Check private key format (should be hex with 0x prefix)
- Ensure facilitator account has funds

**5. "Nonce already used" errors**
- Clear backend nonce cache (restart server)
- Use a fresh nonce for each request

**6. CORS errors in frontend**
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Ensure backend CORS is enabled for localhost

### Getting Help

- Check backend logs: `backend/logs/combined.log`
- Check Aptos Explorer: https://explorer.aptoslabs.com/?network=testnet
- Review Move contract events in explorer
- Check browser developer console

## Next Steps

After successful setup:

1. **Test all features thoroughly**
   - Place multiple orders
   - Cancel orders
   - Deposit to vault
   - Withdraw from vault

2. **Monitor performance**
   - Check transaction times
   - Monitor gas costs
   - Track vault share values

3. **Customize for your needs**
   - Adjust order book matching logic
   - Modify vault strategy
   - Enhance UI/UX

4. **Prepare for production**
   - Get smart contracts audited
   - Set up proper key management
   - Configure production infrastructure
   - Implement monitoring and alerts

## Development Tips

- Use `aptos move test` frequently during development
- Keep testnet tokens funded
- Monitor Aptos testnet status: https://status.aptoslabs.com/
- Use Aptos Explorer to debug transactions
- Enable verbose logging in backend during development

---

**Ready to build!** 🚀

If you encounter issues not covered here, please open an issue on GitHub.

