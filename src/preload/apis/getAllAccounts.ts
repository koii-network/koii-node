import config from 'config';
import { getAllAccountsResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (): Promise<getAllAccountsResponse> =>
  sendMessage(config.endpoints.GET_ALL_ACCOUNTS, null);
