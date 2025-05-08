import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType, TasksToMigrate, TaskToMigrate } from 'models';

import { throwDetailedError } from '../../utils';

export const getTasksToMigrate = async (): Promise<TasksToMigrate> => {
  try {
    const tasksToMigrateStringified: string = await namespaceInstance.storeGet(
      SystemDbKeys.MainnetMigrationTasksToMigrate
    );
    const tasksToMigrate =
      (JSON.parse(tasksToMigrateStringified) as Record<
        string,
        TaskToMigrate
      >) || {};
    return tasksToMigrate;
  } catch (error: unknown) {
    console.error('GET TASKS TO MIGRATE: ', error);
    return throwDetailedError({
      detailed: `${error}`,
      type: ErrorType.GENERIC,
    });
  }
};
