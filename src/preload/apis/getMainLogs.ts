import config from 'config';
import { GetMainLogsParam, GetMainLogsResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: GetMainLogsParam): Promise<GetMainLogsResponse> =>
  sendMessage(config.endpoints.GET_MAIN_LOGS, payload);
