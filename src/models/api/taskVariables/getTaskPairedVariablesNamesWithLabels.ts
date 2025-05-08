import { TaskVariableName } from './types';

export type GetTaskPairedVariablesNamesWithLabelsParamType = {
  taskAccountPubKey: string;
};
export type GetTaskPairedVariablesNamesWithLabelsReturnType = {
  name: TaskVariableName;
  label: string;
  variableId: string;
}[];
