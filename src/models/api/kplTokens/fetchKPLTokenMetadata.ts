export interface FetchKPLTokenMetadataResponse {
  chainId: number;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  logoURI: string;
  tags: string[];
}

export interface FetchKPLTokenMetadataParams {
  mintAddress: string;
}

export interface FetchMultipleKPLTokenMetadataParams {
  mintAddresses: string[];
}
