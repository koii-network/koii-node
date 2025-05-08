import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<string> =>
  sendMessage(config.endpoints.GENERATE_SEED_PHRASE, {});
