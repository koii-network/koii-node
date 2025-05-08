import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<number> =>
  sendMessage(config.endpoints.REDEEM_TOKENS_IN_NEW_NETWORK, {});
