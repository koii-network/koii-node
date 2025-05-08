import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';

import stopTask from './stopTask';
import { getSchedulerTasks } from './tasksScheduler/getSchedulerTasks';
import { StartStopAllTasksParams } from './types';

type StopAllTasksParams = StartStopAllTasksParams;

export const stopAllTasks = async (
  _: Event,
  { runOnlyScheduledTasks = false }: StopAllTasksParams = {}
) => {
  try {
    const startedTasks = await koiiTasks.getStartedTasks();
    const schedulerTasks = runOnlyScheduledTasks
      ? await getSchedulerTasks({} as Event)
      : [];

    const filterSchedulerTasks = schedulerTasks.length > 0;

    const stopTaskPromises = startedTasks
      .filter((rawTaskData) => rawTaskData.is_running)
      .filter((rawTaskData) => {
        if (!filterSchedulerTasks) return true;
        return schedulerTasks.includes(rawTaskData.task_id);
      });

    for (const rawTaskData of stopTaskPromises) {
      await stopTask({} as Event, { taskAccountPubKey: rawTaskData.task_id });
    }
  } catch (error) {
    console.error('Failed to stop all tasks:', error);
    throw error;
  }
};
