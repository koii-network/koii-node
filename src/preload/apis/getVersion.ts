import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<{
  appVersion: string;
  packageVersion: string;
}> => sendMessage(config.endpoints.GET_VERSION, undefined);
