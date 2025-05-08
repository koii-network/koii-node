import config from 'config';
import { GetTaskVariablesNamesParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (params: GetTaskVariablesNamesParam): Promise<string[]> =>
  sendMessage(config.endpoints.GET_TASK_VARIABLES_NAMES, params);
