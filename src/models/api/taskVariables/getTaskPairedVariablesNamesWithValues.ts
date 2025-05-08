import { TaskVariableName } from './types';

export type GetTaskPairedVariablesNamesWithValuesParamType = {
  taskAccountPubKey: string;
  shouldValidateTask?: boolean;
};
export type GetTaskPairedVariablesNamesWithValuesReturnType = Record<
  TaskVariableName,
  string
>;
