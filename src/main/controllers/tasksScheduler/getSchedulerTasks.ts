import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSchedulerTasks = async (event: Event): Promise<string[]> => {
  try {
    const dbResult = await namespaceInstance.storeGet(
      SystemDbKeys.SchedulerTasks
    );

    const results = JSON.parse(dbResult) as string[];
    return results ?? [];
  } catch (err) {
    console.log('Error getting scheduler tasks', err);
    throw err;
  }
};
