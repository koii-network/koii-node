import { ROE } from 'models/api/storeAllTimeRewards';

import { getAllAccountsResponse } from './getAllAccounts';

export type OwnerAccount = Omit<
  getAllAccountsResponse[0],
  'isDefault' | 'mainPublicKeyBalance' | 'stakingPublicKeyBalance'
>;

export interface TaskToMigrate extends OwnerAccount {
  publicKey: string;
  stake: ROE;
}

export type TasksToMigrate = Record<string, TaskToMigrate>;
