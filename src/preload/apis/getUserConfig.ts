import config from 'config';
import { getUserConfigResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (): Promise<getUserConfigResponse> =>
  sendMessage(config.endpoints.GET_USER_CONFIG, {});
