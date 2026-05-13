import { createPublicClient, http } from 'viem';

// Scaffold configuration for HyperEVM
export const hyperEVMChain = {
  id: 999, // Replace with the actual HyperEVM chain ID when available
  name: 'HyperEVM Testnet',
  network: 'hyperevm',
  nativeCurrency: {
    decimals: 18,
    name: 'Hyperliquid',
    symbol: 'HL', 
  },
  rpcUrls: {
    public: { http: ['https://api.hyperliquid.xyz/evm'] }, // Placeholder RPC
    default: { http: ['https://api.hyperliquid.xyz/evm'] },
  },
} as const;

export const getPublicClient = () => {
  return createPublicClient({
    chain: hyperEVMChain,
    transport: http(),
  });
};

export const getWalletClient = (provider: any) => {
  // Scaffold: add wallet connection logic here (e.g., using Privy with Viem)
};
