export interface Account {
  accountName: string;
  stakingPublicKey: string;
  kplStakingPublicKey?: string;
  mainPublicKey: string;
  isDefault: boolean;
  mainPublicKeyBalance: number;
  stakingPublicKeyBalance: number;
  kplStakingPublicKeyBalance: number;
}

export type getAllAccountsResponse = Account[];
