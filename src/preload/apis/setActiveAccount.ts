import config from 'config';
import { SetActiveAccountParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: SetActiveAccountParam): Promise<boolean> =>
  sendMessage(config.endpoints.SET_ACTIVE_ACCOUNT, payload);
