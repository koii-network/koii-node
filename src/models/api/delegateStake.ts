import { TransactionSignature } from '@_koii/web3.js';
import { TaskType } from 'models/task';

export interface DelegateStakeParam {
  taskAccountPubKey: string;
  stakePotAccount: string;
  stakeAmount: number;
  isNetworkingTask?: boolean;
  useStakingWallet?: boolean;
  skipIfItIsAlreadyStaked?: boolean;
  taskType?: TaskType;
  mintAddress?: string;
}

export type DelegateStakeResponse = TransactionSignature;
