import config from 'config';
import { GetTaskInfoParam, GetTaskInfoResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: GetTaskInfoParam): Promise<GetTaskInfoResponse> =>
  sendMessage(config.endpoints.GET_TASK_INFO, payload);
