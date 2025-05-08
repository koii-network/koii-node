import config from 'config';
import { GetIsTaskRunningParam } from 'models';
import sendMessage from 'preload/sendMessage';

export default (params: GetIsTaskRunningParam): Promise<boolean> =>
  sendMessage(config.endpoints.GET_IS_TASK_RUNNING, params);
