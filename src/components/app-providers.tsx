
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { Toaster } from "@/components/ui/toaster";
import { CampaignProvider } from "@/context/campaign-context";

const queryClient = new QueryClient();

// Define a network config that includes all supported networks.
const networkConfig = {
    testnet: { url: getFullnodeUrl("testnet") },
    devnet: { url: getFullnodeUrl("devnet") },
    mainnet: { url: getFullnodeUrl("mainnet") },
};

// Determine the default network from environment variables, falling back to "testnet".
// We assert the type to satisfy the SuiClientProvider's expected props.
const defaultNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK as "mainnet" | "testnet" | "devnet") || "testnet";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
        <WalletProvider autoConnect>
          <CampaignProvider>
            {children}
            <Toaster />
          </CampaignProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
