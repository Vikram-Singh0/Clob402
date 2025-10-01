# ⚡ Quick Start Guide

Get up and running with the x402 CLOB in 5 minutes!

## 🎯 Prerequisites Checklist

```bash
# Check Node.js (need 18+)
node --version

# Check Aptos CLI
aptos --version

# If missing, install:
brew install aptos  # macOS
# or visit: https://aptos.dev/tools/install-cli/
```

## 🚀 3-Step Setup

### Step 1: Initial Setup (2 min)

```bash
# Navigate to project
cd /Users/samshow/Desktop/Clob402

# Run automated setup
./scripts/setup-dev.sh

# This installs all dependencies and creates .env files
```

### Step 2: Deploy Contracts (2 min)

```bash
# Create and fund Aptos account
aptos init --profile facilitator --network testnet
aptos account fund-with-faucet --account facilitator --amount 100000000

# Deploy everything
./scripts/deploy-contracts.sh

# Save the displayed addresses!
```

### Step 3: Configure & Run (1 min)

```bash
# Edit backend/.env with your facilitator private key
# (Get it from ~/.aptos/config.yaml)

# Edit frontend/.env.local with the contract addresses
# (Displayed after deployment)

# Start everything
npm run dev

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

## 🎮 Test It Out

### 1. Open Frontend
Visit `http://localhost:3000`

### 2. Connect Wallet
- Click "Connect Wallet"
- Choose Petra or Martian
- Approve connection

### 3. Place First Order
- Go to "Trade" tab
- Enter price: `10.50`
- Enter quantity: `100`
- Click "Place Buy Order"
- Sign in wallet
- ✅ Done! Zero gas fees paid

### 4. Try the Vault
- Go to "Strategy Vault" tab
- Enter deposit amount: `1000`
- Click "Deposit"
- Sign transaction
- ✅ Vault shares received

## 📋 Environment Variables Quick Reference

### backend/.env
```bash
FACILITATOR_PRIVATE_KEY=0xYOUR_KEY_HERE
FACILITATOR_ADDRESS=0xYOUR_ADDRESS
MODULE_ADDRESS=0xYOUR_ADDRESS
ORDER_BOOK_ADDRESS=0xYOUR_ADDRESS
VAULT_ADDRESS=0xYOUR_ADDRESS
```

### frontend/.env.local
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MODULE_ADDRESS=0xYOUR_ADDRESS
NEXT_PUBLIC_ORDER_BOOK_ADDRESS=0xYOUR_ADDRESS
NEXT_PUBLIC_VAULT_ADDRESS=0xYOUR_ADDRESS
```

## 🔍 Verify Everything Works

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "facilitatorAddress": "0x...",
  "network": "testnet"
}
```

### Check Frontend
1. Open browser to `http://localhost:3000`
2. Should see order book and trading interface
3. No console errors

### Check Contracts
```bash
# View your deployed modules
aptos account list --account facilitator

# Check on explorer
# Visit: https://explorer.aptoslabs.com/account/YOUR_ADDRESS?network=testnet
```

## 🆘 Troubleshooting

### "Command not found: aptos"
```bash
brew install aptos
```

### "Insufficient balance" errors
```bash
aptos account fund-with-faucet --account facilitator --amount 100000000
```

### "Module not found" when deploying
```bash
# Verify Move.toml has correct address
cd move
cat Move.toml | grep clob_strategy_vault
```

### Backend won't start
```bash
# Check .env file exists and has values
cat backend/.env

# Ensure dependencies installed
cd backend && npm install
```

### Frontend shows wallet errors
```bash
# Install wallet extension:
# Petra: https://petra.app/
# Martian: https://martianwallet.xyz/

# Make sure you're on testnet in wallet settings
```

## 📚 Next Steps

✅ **Working MVP?** Great! Now:

1. Read `ARCHITECTURE.md` - understand the system
2. Review `SETUP.md` - detailed configuration
3. Check smart contracts in `move/sources/`
4. Explore API endpoints in `backend/src/routes/`
5. Customize UI in `frontend/src/components/`

## 🎯 Common Tasks

### Add Testnet Funds
```bash
aptos account fund-with-faucet --account facilitator --amount 100000000
```

### Redeploy Contracts
```bash
cd move
aptos move publish --profile facilitator --assume-yes
```

### Restart Everything
```bash
# Stop running servers (Ctrl+C)
npm run dev  # Starts both backend and frontend
```

### View Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# Frontend logs
# Check browser console
```

### Reset Everything
```bash
# Clean build artifacts
npm run clean

# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install

# Redeploy contracts
./scripts/deploy-contracts.sh
```

## 💡 Pro Tips

1. **Keep testnet funded**: Run faucet command regularly
2. **Use Aptos Explorer**: Verify all transactions on-chain
3. **Check backend logs**: Debug issues faster
4. **Test incrementally**: Verify each component separately
5. **Save your keys**: Backup `~/.aptos/config.yaml`

## 🎉 Success Indicators

✅ Backend health check returns 200
✅ Frontend loads without errors
✅ Wallet connects successfully
✅ Orders can be placed and signed
✅ Vault deposits work
✅ Transactions appear in Aptos Explorer

**You're ready to build!** 🚀

---

Need help? Check:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup
- `ARCHITECTURE.md` - Technical details
- `PROJECT_SUMMARY.md` - What's included

**Happy building on Aptos!** ⚡

