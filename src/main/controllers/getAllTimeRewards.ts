import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { GetAllTimeRewardsResponse } from 'models/api';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

export const getAllTimeRewards =
  async (): Promise<GetAllTimeRewardsResponse> => {
    try {
      const allTimeRewardsStringified: string =
        await namespaceInstance.storeGet(SystemDbKeys.AllTimeRewards);
      const allTimeRewards = JSON.parse(allTimeRewardsStringified) as Record<
        string,
        number
      >;
      return allTimeRewards || {};
    } catch (err: any) {
      console.error('getting all time rewards: ', err);
      return throwDetailedError({
        detailed: err,
        type: ErrorType.GENERIC,
      });
    }
  };
