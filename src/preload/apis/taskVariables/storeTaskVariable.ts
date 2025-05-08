import config from 'config';
import { TaskVariableData } from 'models';
import sendMessage from 'preload/sendMessage';

export const storeTaskVariable = (payload: TaskVariableData): Promise<void> =>
  sendMessage(config.endpoints.STORE_TASK_VARIABLE, payload);
