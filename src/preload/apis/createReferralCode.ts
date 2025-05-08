import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (walletAddress: string): Promise<string> =>
  sendMessage(config.endpoints.CREATE_REFERRAL_CODE, walletAddress);
