import config from 'config';

import sendMessage from '../sendMessage';

export default (payload: string): Promise<number> =>
  sendMessage(config.endpoints.GET_ACCOUNT_BALANCE, payload);
