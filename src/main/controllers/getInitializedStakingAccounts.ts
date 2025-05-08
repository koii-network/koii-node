import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { GetInitializedStakingAccountsResponse } from 'models/api';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

export const getInitializedStakingAccounts =
  async (): Promise<GetInitializedStakingAccountsResponse> => {
    try {
      const initializedStakingAccountsStringified: string =
        await namespaceInstance.storeGet(
          SystemDbKeys.InitializedStakingAccounts
        );
      const initializedStakingAccounts = JSON.parse(
        initializedStakingAccountsStringified
      ) as GetInitializedStakingAccountsResponse;
      return initializedStakingAccounts || {};
    } catch (err: any) {
      console.error('getting initialized staking accounts: ', err);
      return throwDetailedError({
        detailed: err,
        type: ErrorType.GENERIC,
      });
    }
  };
