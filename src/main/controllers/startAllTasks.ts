import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

import { getRunnedPrivateTasks } from './privateTasks';
import startTask from './startTask';
import { getSchedulerTasks } from './tasksScheduler/getSchedulerTasks';

type StartAllTasksParams = {
  runOnlyScheduledTasks?: boolean;
};

export const startAllTasks = async (
  _: Event,
  { runOnlyScheduledTasks }: StartAllTasksParams = {}
) => {
  try {
    const startedTasks = await koiiTasks.getStartedTasks();
    const schedulerTasks = await getSchedulerTasks({} as Event);

    for (const rawTaskData of startedTasks) {
      if (!rawTaskData.is_running) {
        const privateTasks = await getRunnedPrivateTasks();
        const isPrivate = privateTasks.includes(rawTaskData.task_id);

        /**
         * @dev if actions is triggered by tasks scheduler, we should start only scheduled tasks
         */
        if (
          runOnlyScheduledTasks &&
          !schedulerTasks.includes(rawTaskData.task_id)
        ) {
          console.warn(`Task ${rawTaskData.task_id} isn't scheduled, skip it.`);
          return;
        }
        try {
          await startTask({} as Event, {
            taskAccountPubKey: rawTaskData.task_id,
            isPrivate,
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (e: any) {
    if (e?.message !== 'Tasks not fetched yet') console.error(e);
    return throwDetailedError({
      detailed: e,
      type: ErrorType.GENERIC,
    });
  }
};
