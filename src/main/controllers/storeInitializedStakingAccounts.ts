import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { StoreInitializedStakingAccountsParam } from 'models';

import { getInitializedStakingAccounts } from './getInitializedStakingAccounts';

export const storeInitializedStakingAccounts = async (
  _: Event,
  { publicKey, isInitialized }: StoreInitializedStakingAccountsParam
): Promise<boolean> => {
  try {
    const initializedStakingAccounts = await getInitializedStakingAccounts();
    const newInitializedStakingAccounts = {
      ...initializedStakingAccounts,
      [publicKey]: isInitialized,
    };
    const stringifiedInitializedStakingAccounts = JSON.stringify(
      newInitializedStakingAccounts
    );
    await namespaceInstance.storeSet(
      SystemDbKeys.InitializedStakingAccounts,
      stringifiedInitializedStakingAccounts
    );
    return true;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};
