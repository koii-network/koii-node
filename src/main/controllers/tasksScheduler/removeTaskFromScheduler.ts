import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getSchedulerTasks } from './getSchedulerTasks';

export const removeTaskFromScheduler = async (
  event: Event,
  payload: { taskPublicKey: string }
): Promise<void> => {
  const { taskPublicKey } = payload;

  try {
    const schedulerTasks = await getSchedulerTasks({} as Event);

    if (!schedulerTasks.includes(taskPublicKey)) {
      console.log('Task not found in scheduler');
      return;
    }

    const updatedSchedulerTasks = schedulerTasks.filter(
      (task) => task !== taskPublicKey
    );

    await namespaceInstance.storeSet(
      SystemDbKeys.SchedulerTasks,
      JSON.stringify(updatedSchedulerTasks)
    );
  } catch (err) {
    console.error('Error in removeTaskFromScheduler:', err);
    throw err;
  }
};
