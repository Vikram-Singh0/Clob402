"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Wallet as WalletIcon, Users } from "lucide-react";

export function VaultDashboard() {
  const { account, connected } = useWallet();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawShares, setWithdrawShares] = useState("");
  const [userShares, setUserShares] = useState(0);
  const [vaultInfo, setVaultInfo] = useState({
    totalDeposits: 0,
    totalShares: 0,
    referenceTrader: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && account) {
      fetchVaultData();
    }
  }, [connected, account]);

  const fetchVaultData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      
      // Fetch vault info
      const vaultResponse = await fetch(`${backendUrl}/api/vault/info`);
      if (vaultResponse.ok) {
        const data = await vaultResponse.json();
        setVaultInfo({
          totalDeposits: data.totalDeposits || 0,
          totalShares: data.totalShares || 0,
          referenceTrader: data.referenceTrader || "",
        });
      }

      // Fetch user shares
      const sharesResponse = await fetch(`${backendUrl}/api/vault/shares/${account?.address}`);
      if (sharesResponse.ok) {
        const data = await sharesResponse.json();
        setUserShares(data.shares || 0);
      }
    } catch (error) {
      console.error("Error fetching vault data:", error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/vault/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account?.address,
          amount: parseFloat(depositAmount),
        }),
      });

      if (response.ok) {
        setDepositAmount("");
        await fetchVaultData();
      }
    } catch (error) {
      console.error("Error depositing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawShares || parseFloat(withdrawShares) <= 0) return;
    
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/vault/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account?.address,
          shares: parseFloat(withdrawShares),
        }),
      });

      if (response.ok) {
        setWithdrawShares("");
        await fetchVaultData();
      }
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareValue = vaultInfo.totalShares > 0 
    ? vaultInfo.totalDeposits / vaultInfo.totalShares 
    : 1;

  const userValue = userShares * shareValue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vault Stats */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${vaultInfo.totalDeposits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {vaultInfo.totalShares.toLocaleString()} shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Position</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userShares.toLocaleString()} shares</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${userValue.toFixed(2)} USDC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Share Price</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${shareValue.toFixed(4)}</div>
            <p className="text-xs text-green-500 mt-1">
              +0.00% (24h)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Card */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
          <CardDescription>Add funds to the strategy vault</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (USDC)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              step="0.01"
            />
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You will receive:</span>
              <span className="font-semibold">
                {depositAmount ? (parseFloat(depositAmount) / shareValue).toFixed(2) : "0.00"} shares
              </span>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleDeposit}
            disabled={loading || !connected || !depositAmount}
          >
            {loading ? "Processing..." : "Deposit"}
          </Button>
        </CardContent>
      </Card>

      {/* Withdraw Card */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw</CardTitle>
          <CardDescription>Redeem your vault shares</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-shares">Shares</Label>
            <Input
              id="withdraw-shares"
              type="number"
              placeholder="0.00"
              value={withdrawShares}
              onChange={(e) => setWithdrawShares(e.target.value)}
              step="0.01"
            />
            <div className="text-xs text-muted-foreground">
              Available: {userShares.toFixed(2)} shares
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You will receive:</span>
              <span className="font-semibold">
                {withdrawShares ? (parseFloat(withdrawShares) * shareValue).toFixed(2) : "0.00"} USDC
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleWithdraw}
            disabled={loading || !connected || !withdrawShares}
          >
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </CardContent>
      </Card>

      {/* Strategy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Info</CardTitle>
          <CardDescription>Copy-trading vault details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Reference Trader</div>
              <div className="text-sm font-mono mt-1">
                {vaultInfo.referenceTrader 
                  ? `${vaultInfo.referenceTrader.slice(0, 8)}...${vaultInfo.referenceTrader.slice(-6)}`
                  : "Not set"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Strategy Type</div>
              <div className="text-sm font-medium mt-1">Copy Trading</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Performance Fee</div>
              <div className="text-sm font-medium mt-1">10% on profits</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-sm font-medium mt-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!connected && (
        <Card className="lg:col-span-3">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Connect your wallet to view and manage your vault position
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

