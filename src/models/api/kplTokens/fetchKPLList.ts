export interface Token {
  chainId: number;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  logoURI: string;
  tags: string[];
}

export interface fetchKPLListResponse {
  name: string;
  tokenList: Token[];
}
