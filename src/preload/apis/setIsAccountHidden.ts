import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: {
  accountName: string;
  isHidden: boolean;
}): Promise<void> =>
  sendMessage(config.endpoints.SET_IS_ACCOUNT_HIDDEN, payload);
