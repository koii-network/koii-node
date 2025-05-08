import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { accountName: string }): Promise<boolean> =>
  sendMessage(config.endpoints.GET_IS_ACCOUNT_HIDDEN, payload);
