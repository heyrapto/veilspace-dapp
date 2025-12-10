"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { base } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

// Configure for Base mainnet
export const wagmiConfig = getDefaultConfig({
  appName: "Optrix.finance",
  projectId: "3114d3c28803a5d487e6f5b2d5e0655b",
  chains: [base], // Base mainnet
  ssr: true,
});

export function WagmiProviders({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}