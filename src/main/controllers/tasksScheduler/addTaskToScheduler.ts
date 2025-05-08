import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getSchedulerTasks } from './getSchedulerTasks';
// import { AddTaskToSchedulerParams } from 'models/api';

export const addTaskToScheduler = async (
  event: Event,
  payload: { taskPublicKey: string }
): Promise<void> => {
  const { taskPublicKey } = payload;

  try {
    const schedulerTasks = (await getSchedulerTasks({} as Event)) ?? [];

    if (schedulerTasks.includes(taskPublicKey)) {
      console.log('Task already in scheduler');
      return;
    }

    schedulerTasks.push(taskPublicKey);

    await namespaceInstance.storeSet(
      SystemDbKeys.SchedulerTasks,
      JSON.stringify(schedulerTasks)
    );
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};
