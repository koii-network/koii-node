import config from 'config';
import { GetTaskLogsParam, GetTaskLogsResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: GetTaskLogsParam): Promise<GetTaskLogsResponse> =>
  sendMessage(config.endpoints.GET_TASK_LOGS, payload);
