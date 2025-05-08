import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { seedPhraseString: string }): Promise<any> =>
  sendMessage(config.endpoints.RESET_PIN, payload);
