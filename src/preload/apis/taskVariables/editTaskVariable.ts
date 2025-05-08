import config from 'config';
import { EditTaskVariableParamType } from 'models';
import sendMessage from 'preload/sendMessage';

export const editTaskVariable = (
  payload: EditTaskVariableParamType
): Promise<void> => sendMessage(config.endpoints.EDIT_TASK_VARIABLE, payload);
