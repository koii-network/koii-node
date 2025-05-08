import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType, TaskToMigrate } from 'models';
import { throwDetailedError } from 'utils';

import { getTasksToMigrate } from './getTasksToMigrate';

export const storeTaskToMigrate = async (
  newTaskToMigrate: TaskToMigrate
): Promise<boolean> => {
  try {
    const tasksToMigrate = await getTasksToMigrate();
    const updatedTasksToMigrate = {
      ...tasksToMigrate,
      [newTaskToMigrate.publicKey]: newTaskToMigrate,
    };
    console.log({ updatedTasksToMigrate });
    const stringifiedTasksToMigrate = JSON.stringify(updatedTasksToMigrate);
    await namespaceInstance.storeSet(
      SystemDbKeys.MainnetMigrationTasksToMigrate,
      stringifiedTasksToMigrate
    );
    return true;
  } catch (error) {
    console.error('STORE TASKS TO MIGRATE: ', error);
    return throwDetailedError({
      detailed: `${error}`,
      type: ErrorType.GENERIC,
    });
  }
};
