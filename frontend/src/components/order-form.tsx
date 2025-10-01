"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function OrderForm() {
  const { account, connected, signMessage } = useWallet();
  const { toast } = useToast();
  
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellQuantity, setSellQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (side: "buy" | "sell") => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place orders",
        variant: "destructive",
      });
      return;
    }

    const price = side === "buy" ? buyPrice : sellPrice;
    const quantity = side === "buy" ? buyQuantity : sellQuantity;

    if (!price || !quantity) {
      toast({
        title: "Invalid input",
        description: "Please enter both price and quantity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Request payment intent (HTTP 402)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const intentResponse = await fetch(`${backendUrl}/api/auth/request-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: account?.address,
          recipient: process.env.NEXT_PUBLIC_MODULE_ADDRESS,
          amount: parseFloat(price) * parseFloat(quantity),
        }),
      });

      if (intentResponse.status !== 402) {
        throw new Error("Failed to get payment intent");
      }

      const intentData = await intentResponse.json();
      const { intent } = intentData;

      // Step 2: Sign the payment authorization
      const message = constructAuthMessage(intent);
      const signedMessage = await signMessage({ message });

      // Step 3: Submit signed authorization
      const authResponse = await fetch(`${backendUrl}/api/auth/submit-authorization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: intent.sender,
          recipient: intent.recipient,
          amount: intent.amount,
          nonce: intent.nonce,
          expiry: intent.expiry,
          signature: signedMessage.signature,
          publicKey: account?.publicKey,
        }),
      });

      if (!authResponse.ok) {
        throw new Error("Failed to submit authorization");
      }

      const authResult = await authResponse.json();

      // Step 4: Place order
      const orderResponse = await fetch(`${backendUrl}/api/orders/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account?.address,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          side: side === "buy" ? 0 : 1,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to place order");
      }

      const orderResult = await orderResponse.json();

      toast({
        title: "Order placed successfully!",
        description: `${side.toUpperCase()} ${quantity} @ $${price}`,
      });

      // Reset form
      if (side === "buy") {
        setBuyPrice("");
        setBuyQuantity("");
      } else {
        setSellPrice("");
        setSellQuantity("");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const constructAuthMessage = (intent: any): string => {
    return JSON.stringify(intent);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-price">Price (USDC)</Label>
              <Input
                id="buy-price"
                type="number"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-quantity">Quantity (APT)</Label>
              <Input
                id="buy-quantity"
                type="number"
                placeholder="0.00"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">
                  ${((parseFloat(buyPrice) || 0) * (parseFloat(buyQuantity) || 0)).toFixed(2)} USDC
                </span>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handlePlaceOrder("buy")}
              disabled={loading || !connected}
            >
              {loading ? "Processing..." : "Place Buy Order"}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-price">Price (USDC)</Label>
              <Input
                id="sell-price"
                type="number"
                placeholder="0.00"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-quantity">Quantity (APT)</Label>
              <Input
                id="sell-quantity"
                type="number"
                placeholder="0.00"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">
                  ${((parseFloat(sellPrice) || 0) * (parseFloat(sellQuantity) || 0)).toFixed(2)} USDC
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => handlePlaceOrder("sell")}
              disabled={loading || !connected}
            >
              {loading ? "Processing..." : "Place Sell Order"}
            </Button>
          </TabsContent>
        </Tabs>

        {!connected && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-center text-muted-foreground">
            Connect your wallet to start trading
          </div>
        )}
      </CardContent>
    </Card>
  );
}

