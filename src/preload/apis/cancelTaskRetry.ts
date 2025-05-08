import config from 'config';
import { CancelTaskRetryParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: CancelTaskRetryParam): Promise<string[]> =>
  sendMessage(config.endpoints.CANCEL_TASK_RETRY, payload);
