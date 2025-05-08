import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { StoreAllTimeRewardsParam } from 'models/api';

import { getAllTimeRewards } from './getAllTimeRewards';

export const storeAllTimeRewards = async (
  _: Event,
  { taskId, newReward }: StoreAllTimeRewardsParam
): Promise<boolean> => {
  try {
    const allTimeRewards = await getAllTimeRewards();
    const allTimeRewardsForTask = allTimeRewards[taskId] || 0;
    const newAllTimeRewards = {
      ...allTimeRewards,
      [taskId]: allTimeRewardsForTask + newReward,
    };
    const stringifiedAllTimeRewards = JSON.stringify(newAllTimeRewards);
    await namespaceInstance.storeSet(
      SystemDbKeys.AllTimeRewards,
      stringifiedAllTimeRewards
    );
    return true;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};
