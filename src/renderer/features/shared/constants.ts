export const TESTNET_RPC_URL = 'https://testnet.koii.network';
export const LEGACY_TESTNET_RPC_URL = 'https://testnet.koii.live';
export const EMERGENCY_TESTNET_RPC_URL = 'https://testnet.koii.live';
export const DEVNET_RPC_URL = 'https://devnet.koii.network';
export const MAINNET_RPC_URL = 'https://desktop-node-rpc.mainnet.koii.network';

export const AVAILABLE_NETWORKS = {
  testnet: {
    name: 'Testnet',
    url: TESTNET_RPC_URL,
  },
  legacyTestnet: {
    name: 'Legacy Testnet',
    url: LEGACY_TESTNET_RPC_URL,
  },

  devnet: {
    name: 'Devnet',
    url: DEVNET_RPC_URL,
  },
  mainnet: {
    name: 'Mainnet',
    url: MAINNET_RPC_URL,
  },
} as const;

export type NetworkType =
  (typeof AVAILABLE_NETWORKS)[keyof typeof AVAILABLE_NETWORKS];
export type NetworkUrlType = NetworkType['url'];
