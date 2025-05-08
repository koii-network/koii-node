import { Event } from 'electron';

import { electronStoreService } from 'main/node/helpers/electronStoreService';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import koiiTasks from 'main/services/koiiTasks';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

export const getTimeToNextReward = async (
  _: Event,
  payload: { averageSlotTime: number }
): Promise<number> => {
  try {
    const timeToNextReward = await calculateTimeToNextRewardConsideringUpdates(
      payload.averageSlotTime
    );

    return timeToNextReward;
  } catch (error) {
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.FETCHING_NEXT_REWARD_FAILED,
    });
  }
};

async function calculateTimeToNextRewardConsideringUpdates(
  averageSlotTime: number
): Promise<number> {
  let timeToNextReward = await calculateRewardTime(averageSlotTime);

  if (timeToNextReward <= 0) {
    await koiiTasks.updateRewardsQueue();
    timeToNextReward = await calculateRewardTime(averageSlotTime);
  }

  return timeToNextReward;
}

async function calculateRewardTime(averageSlotTime: number): Promise<number> {
  const tasks = electronStoreService.getTimeToNextRewardAsSlots() ?? 0;
  const currentSlot = await namespaceInstance.getCurrentSlot();
  const currentSlotComesWithDefaultValue = currentSlot === -1;

  if (currentSlotComesWithDefaultValue) {
    throw new Error('K2 returned an invalid current slot');
  } else {
    return calculateTimeToNextReward(averageSlotTime, tasks, currentSlot);
  }
}

function calculateTimeToNextReward(
  averageSlotTime: number,
  tasks: number,
  currentSlot: number
): number {
  return Math.ceil(averageSlotTime * (tasks - currentSlot));
}
