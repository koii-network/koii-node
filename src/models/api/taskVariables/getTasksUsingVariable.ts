import { Task } from 'models/task';

import { DesktopNodeVariableID } from './types';

export type GetTasksPairedWithVariableParamType = {
  variableId: DesktopNodeVariableID;
};

export type GetTasksPairedWithVariableReturnType = Task[];
