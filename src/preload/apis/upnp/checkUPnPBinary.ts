import config from 'config';
import sendMessage from 'preload/sendMessage';

export const checkUPnPBinary = (): Promise<boolean> =>
  sendMessage(config.endpoints.CHECK_UPNP_BINARY, {});
