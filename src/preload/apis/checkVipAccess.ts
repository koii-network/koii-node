import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): // walletAddress: string
Promise<'vip-enabled' | 'vip-disabled' | 'no-access'> =>
  sendMessage(config.endpoints.CHECK_VIP_ACCESS, null);
