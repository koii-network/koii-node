import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';

export const getRunningTasksPubKeys = async (
  event: Event
): Promise<string[]> => {
  const runningTasks = koiiTasks.RUNNING_TASKS;
  const runningTasksPubKeys = Object.keys(runningTasks);
  return runningTasksPubKeys;
};
