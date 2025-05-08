import config from 'config';
import { GetRetryDataByTaskIdParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: GetRetryDataByTaskIdParam): Promise<string[]> =>
  sendMessage(config.endpoints.GET_RETRY_DATA_BY_TASK_ID, payload);
