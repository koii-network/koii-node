import { Event } from 'electron';

import {
  ErrorType,
  GetTaskPairedVariablesNamesWithValuesParamType,
  GetTaskPairedVariablesNamesWithValuesReturnType,
} from 'models';
import { throwDetailedError } from 'utils';

import { getPairedTaskVariableData } from './getPairedTaskVariableData';

export const getTaskPairedVariablesNamesWithValues = async (
  _: Event,
  payload: GetTaskPairedVariablesNamesWithValuesParamType
): Promise<GetTaskPairedVariablesNamesWithValuesReturnType> => {
  const { taskPairings, taskVariables } = await getPairedTaskVariableData(
    payload
  );

  return Object.entries(taskPairings || {}).reduce(
    (res, [taskVariableName, desktopVariableId]) => {
      if (!taskVariables[desktopVariableId]) {
        return throwDetailedError({
          detailed:
            'getTaskPairedVariablesNamesWithValues error: No paired Task variable stored',
          type: ErrorType.GENERIC,
        });
      }
      return {
        ...res,
        [taskVariableName]: taskVariables[desktopVariableId].value,
      };
    },
    {}
  );
};
