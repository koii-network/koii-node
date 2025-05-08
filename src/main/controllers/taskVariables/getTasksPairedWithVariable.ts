import { isString } from 'lodash';
import { parseRawK2TaskData } from 'main/node/helpers/parseRawK2TaskData';
import koiiTasks from 'main/services/koiiTasks';
import {
  ErrorType,
  GetTasksPairedWithVariableParamType,
  GetTasksPairedWithVariableReturnType,
} from 'models';
import { throwDetailedError } from 'utils';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';

export const getTasksPairedWithVariable = async (
  _: Event,
  payload: GetTasksPairedWithVariableParamType
): Promise<GetTasksPairedWithVariableReturnType> => {
  // payload validation
  if (!payload?.variableId || !isString(payload?.variableId)) {
    throw throwDetailedError({
      detailed: 'Get Task Using Variable: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  const pairedTaskVariables = await getStoredPairedTaskVariables();

  const taskIdsUsingVariable = Object.keys(pairedTaskVariables).filter(
    (taskId) =>
      Object.values(pairedTaskVariables[taskId]).includes(payload.variableId)
  );

  const startedTasks = await koiiTasks.getStartedTasks();
  const tasksUsingVariable = startedTasks.filter((task) =>
    taskIdsUsingVariable.includes(task.task_id)
  );

  const tasksUsingVariableParsed = tasksUsingVariable.map((rawTaskData) => ({
    publicKey: rawTaskData.task_id,
    data: parseRawK2TaskData({ rawTaskData, isRunning: true }),
  }));

  return tasksUsingVariableParsed;
};
