import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (params: { address: string }): Promise<boolean> =>
  sendMessage(config.endpoints.VALIDATE_PUBLIC_KEY, params);
