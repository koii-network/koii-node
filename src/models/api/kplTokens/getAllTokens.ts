export interface KPLToken {
  chainId: number;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  logoURI: string;
  tags: string[];
}

export type getAllTokensResponse = KPLToken[];
