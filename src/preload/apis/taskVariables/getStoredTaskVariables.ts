import config from 'config';
import { TaskVariablesReturnType } from 'models/api/taskVariables/getStoredTaskVariables';
import sendMessage from 'preload/sendMessage';

export const getStoredTaskVariables = (): Promise<TaskVariablesReturnType> =>
  sendMessage(config.endpoints.GET_STORED_TASK_VARIABLES, {});
