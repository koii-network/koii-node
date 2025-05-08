import { Event } from 'electron';

import { isString, map } from 'lodash';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import {
  DeleteTaskVariableParamType,
  ErrorType,
  Task,
  TaskVariables,
} from 'models';
import { throwDetailedError } from 'utils';

import { PersistentStoreKeys } from '../types';

import { getStoredTaskVariables } from './getStoredTaskVariables';
import { getTasksPairedWithVariable } from './getTasksPairedWithVariable';
import { unpairTaskVariable } from './unpairTaskVariable';

export const deleteTaskVariable = async (
  _event: Event,
  idForDeletion: DeleteTaskVariableParamType
): Promise<void> => {
  const taskVariables = await getStoredTaskVariables();
  // throw error if payload is not valid
  if (!idForDeletion || !isString(idForDeletion)) {
    throw throwDetailedError({
      detailed: 'Delete Task Variable Error: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  const isExistingVariableId =
    Object.keys(taskVariables).includes(idForDeletion);

  if (!isExistingVariableId) {
    throw throwDetailedError({
      detailed: `Delete Task Variable Error: task variable with ID "${idForDeletion}" was not found`,
      type: ErrorType.GENERIC,
    });
  }

  const tasksUsingVariable: Task[] = await getTasksPairedWithVariable(
    {} as Event,
    {
      variableId: idForDeletion,
    }
  );

  // unpair every task using variable for deletion
  console.log(
    `Unpairing Task Variable ID "${idForDeletion}" from following Tasks (id) ${map(
      tasksUsingVariable,
      'publicKey'
    )}`
  );

  await Promise.all(
    tasksUsingVariable.map(async ({ publicKey }) =>
      unpairTaskVariable({} as Event, {
        taskAccountPubKey: publicKey,
        desktopVariableId: idForDeletion,
      })
    )
  );

  console.log(`Deleting Task Variable with ID "${idForDeletion}"`);

  const newTaskVariables: TaskVariables = {
    ...taskVariables,
  };
  delete newTaskVariables[idForDeletion];

  const stringifiedTaskVariableValue = JSON.stringify(newTaskVariables);

  await namespaceInstance.storeSet(
    PersistentStoreKeys.TaskVariables,
    stringifiedTaskVariableValue
  );
};
