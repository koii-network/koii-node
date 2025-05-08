import { GetTaskPairedVariablesNamesWithValuesParamType } from './getTaskPairedVariablesNamesWithValues';
import { TaskPairing, TaskVariables } from './types';

export type GetPairedTaskVariableDataParamType =
  GetTaskPairedVariablesNamesWithValuesParamType;
export type GetPairedTaskVariableDataReturnType = {
  taskPairings: TaskPairing;
  taskVariables: TaskVariables;
};
