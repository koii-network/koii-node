import { GetAllTimeRewardsParam } from 'models/api';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

import { getAllTimeRewards } from './getAllTimeRewards';

export const getAllTimeRewardsByTask = async (
  _: Event,
  { taskId }: GetAllTimeRewardsParam
): Promise<number> => {
  try {
    const allTimeRewards = await getAllTimeRewards();
    const allTimeRewardsForTask = allTimeRewards[taskId] || 0;
    return allTimeRewardsForTask;
  } catch (err: any) {
    console.error('getting all time rewards: ', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};
