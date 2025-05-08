import { Event } from 'electron';

import {
  ErrorType,
  GetTaskPairedVariablesNamesWithLabelsParamType,
  GetTaskPairedVariablesNamesWithLabelsReturnType,
} from 'models';
import { throwDetailedError } from 'utils';

import { getPairedTaskVariableData } from './getPairedTaskVariableData';

export const getTaskPairedVariablesNamesWithLabels = async (
  _: Event,
  payload: GetTaskPairedVariablesNamesWithLabelsParamType
): Promise<GetTaskPairedVariablesNamesWithLabelsReturnType> => {
  const { taskPairings, taskVariables } = await getPairedTaskVariableData(
    payload
  );

  return Object.entries(taskPairings || {}).map(
    ([taskVariableName, desktopVariableId]) => {
      if (!taskVariables[desktopVariableId]) {
        return throwDetailedError({
          detailed:
            'getTaskPairedVariablesNamesWithLabels error: No paired Task variable stored',
          type: ErrorType.GENERIC,
        });
      }
      return {
        name: taskVariableName,
        label: taskVariables[desktopVariableId].label,
        variableId: desktopVariableId,
      };
    }
  );
};
