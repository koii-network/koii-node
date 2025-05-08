import { loadAndExecuteTasks } from 'main/node';
import koiiTasks from 'main/services/koiiTasks';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

import getUserConfig from './getUserConfig';

export const initializeTasks = async (): Promise<void> => {
  try {
    const userConfig = await getUserConfig();
    if (userConfig?.hasFinishedTheMainnetMigration) {
      await koiiTasks.initializeTasks();
      await loadAndExecuteTasks();
    }
  } catch (err) {
    console.log('INITIALIZATION ERROR', err);
    return throwDetailedError({
      detailed: err as string,
      type: ErrorType.NODE_INITIALIZATION_FAILED,
    });
  }
};
