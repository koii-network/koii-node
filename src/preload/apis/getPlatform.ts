import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<{
  platform: string;
  image: string;
}> => sendMessage(config.endpoints.GET_PLATFORM, undefined);
