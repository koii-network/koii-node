import config from 'config';
import { TaskVariableData } from 'models';
import sendMessage from 'preload/sendMessage';

export const deleteTaskVariable = (
  payload: TaskVariableData['label']
): Promise<void> => sendMessage(config.endpoints.DELETE_TASK_VARIABLE, payload);
