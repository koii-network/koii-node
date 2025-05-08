import { namespaceInstance } from 'main/node/helpers/Namespace';
import { RunningPrivateTasks } from 'models/api/privateTasks/types';

import { PersistentStoreKeys } from '../types';

export const getRunnedPrivateTasks = async (): Promise<RunningPrivateTasks> => {
  const runnedPrivateTasksStringified: string =
    await namespaceInstance.storeGet(PersistentStoreKeys.RunnedPrivateTasks);

  try {
    // Correctly parsing the JSON string to an array
    const runnedPrivateTasks: RunningPrivateTasks = JSON.parse(
      runnedPrivateTasksStringified
    ) as string[];

    // Return the parsed array
    return runnedPrivateTasks ?? [];
  } catch (error) {
    console.log('Get Runned Private Tasks: JSON parse error', error);
    // Return an empty array in case of an error
    return [];
  }
};
