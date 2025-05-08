import { namespaceInstance } from 'main/node/helpers/Namespace';

import { PersistentStoreKeys } from '../types';

import { getRunnedPrivateTasks } from './getRunnedPrivateTasks';

export const setRunnedPrivateTask = async (
  _event: Event,
  payload: {
    runnedPrivateTask: string;
  }
): Promise<void> => {
  try {
    const { runnedPrivateTask } = payload;
    const runnedPrivateTasks = await getRunnedPrivateTasks();

    const privateTaskAlreadyExists =
      runnedPrivateTasks.includes(runnedPrivateTask);
    if (privateTaskAlreadyExists) return;

    runnedPrivateTasks.push(runnedPrivateTask);

    const runnedPrivateTasksStringified = JSON.stringify(runnedPrivateTasks);

    await namespaceInstance.storeSet(
      PersistentStoreKeys.RunnedPrivateTasks,
      runnedPrivateTasksStringified
    );
  } catch (error) {
    console.log('Error in adding runnedPrivateTask:', error);
  }
};
