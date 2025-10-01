"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface Order {
  price: number;
  quantity: number;
  total: number;
}

export function OrderBook() {
  // Mock order book data - in production, fetch from backend
  const [bids, setBids] = useState<Order[]>([
    { price: 10.50, quantity: 100, total: 1050 },
    { price: 10.45, quantity: 250, total: 2612.5 },
    { price: 10.40, quantity: 150, total: 1560 },
    { price: 10.35, quantity: 300, total: 3105 },
    { price: 10.30, quantity: 200, total: 2060 },
  ]);

  const [asks, setAsks] = useState<Order[]>([
    { price: 10.55, quantity: 150, total: 1582.5 },
    { price: 10.60, quantity: 200, total: 2120 },
    { price: 10.65, quantity: 100, total: 1065 },
    { price: 10.70, quantity: 250, total: 2675 },
    { price: 10.75, quantity: 180, total: 1935 },
  ]);

  const spread = asks[0]?.price - bids[0]?.price;
  const spreadPercent = ((spread / bids[0]?.price) * 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Book - APT/USDC</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spread Info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Spread</div>
            <div className="text-lg font-semibold">
              ${spread.toFixed(2)} ({spreadPercent}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Last Price</div>
            <div className="text-lg font-semibold">${bids[0]?.price}</div>
          </div>
        </div>

        {/* Order Book Table */}
        <div className="grid grid-cols-2 gap-4">
          {/* Asks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownIcon className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Asks (Sell)</span>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1">
                <div>Price</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Total</div>
              </div>
              {asks.map((ask, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 text-sm hover:bg-destructive/10 p-1 rounded cursor-pointer transition-colors"
                >
                  <div className="text-destructive font-medium">
                    ${ask.price.toFixed(2)}
                  </div>
                  <div className="text-right">{ask.quantity}</div>
                  <div className="text-right text-muted-foreground">
                    ${ask.total.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bids */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Bids (Buy)</span>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1">
                <div>Price</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Total</div>
              </div>
              {bids.map((bid, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 text-sm hover:bg-green-500/10 p-1 rounded cursor-pointer transition-colors"
                >
                  <div className="text-green-500 font-medium">
                    ${bid.price.toFixed(2)}
                  </div>
                  <div className="text-right">{bid.quantity}</div>
                  <div className="text-right text-muted-foreground">
                    ${bid.total.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

