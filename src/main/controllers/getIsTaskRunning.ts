import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';
import { GetIsTaskRunningParam } from 'models';

export const getIsTaskRunning = async (
  _: Event,
  { taskPublicKey }: GetIsTaskRunningParam
): Promise<boolean> => {
  const runningTaskPubKeys = Object.keys(koiiTasks.RUNNING_TASKS);
  const isRunning = runningTaskPubKeys?.includes(taskPublicKey);
  return isRunning;
};
