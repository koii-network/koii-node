import { TransactionSignature } from '@_koii/web3.js';

export interface ClaimRewardParam {
  taskAccountPubKey: string;
}

export type ClaimRewardResponse = TransactionSignature;
