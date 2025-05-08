import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';

export const getStartedTasksPubKeys = async (
  event?: Event
): Promise<string[]> => {
  return koiiTasks.getStartedTasksPubKeys();
};
