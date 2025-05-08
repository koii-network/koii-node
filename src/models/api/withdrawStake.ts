export interface WithdrawStakeParam {
  taskAccountPubKey: string;
  shouldCheckCachedStake?: boolean;
  taskType: 'KPL' | 'KOII';
}
