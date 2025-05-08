import config from 'config';
import sendMessage from 'preload/sendMessage';

export const verifyMessage = (payload: any): Promise<unknown[]> =>
  sendMessage(config.endpoints.VERIFY_MESSAGE, payload);
