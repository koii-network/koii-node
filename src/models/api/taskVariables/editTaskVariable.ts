import { AtLeastOne } from 'types/utils';

import { TaskVariableData } from './types';

export type EditTaskVariableParamType = {
  variableId: string;
  variableData: AtLeastOne<TaskVariableData>;
};
