"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { OrderBook } from "@/components/order-book";
import { OrderForm } from "@/components/order-form";
import { VaultDashboard } from "@/components/vault-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState("trade");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Aptos CLOB Exchange</h1>
          <p className="text-muted-foreground">
            Gasless trading powered by x402 payment authorization
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="vault">Strategy Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OrderBook />
              </div>
              <div>
                <OrderForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vault">
            <VaultDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

