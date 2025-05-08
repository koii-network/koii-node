import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (walletAddress: string, theme: 'vip' | 'koii') =>
  sendMessage(config.endpoints.TOGGLE_THEME, { walletAddress, theme });
