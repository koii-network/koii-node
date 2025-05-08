import config from 'config';
import { GetTaskSourceParam } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: GetTaskSourceParam): Promise<string> =>
  sendMessage(config.endpoints.GET_TASK_SOURCE, payload);
