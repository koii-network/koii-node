import config from 'config';
import { RemoveAccountByNameParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: RemoveAccountByNameParam): Promise<boolean> =>
  sendMessage(config.endpoints.REMOVE_ACCOUNT_BY_NAME, payload);
