"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Wallet, LogOut } from "lucide-react";

export function Navbar() {
  const { connect, disconnect, account, connected } = useWallet();

  const handleConnect = async () => {
    try {
      // This will trigger wallet selection modal
      await connect("Petra" as any); // or detect available wallets
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-xl font-bold">Aptos CLOB</span>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            
            {connected && account ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-muted text-sm">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

