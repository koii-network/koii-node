import config from 'config';
import sendMessage from 'preload/sendMessage';

export const getOperativeSystem = async (): Promise<
  'windows' | 'macos' | 'linux'
> => sendMessage(config.endpoints.GET_OPERATIVE_SYSTEM, {});
