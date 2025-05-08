import config from 'config';
import { FetchAndSaveuPnPBinaryReturnValue } from 'models';
import sendMessage from 'preload/sendMessage';

export const fetchAndSaveUPnPBinary =
  (): Promise<FetchAndSaveuPnPBinaryReturnValue> =>
    sendMessage(config.endpoints.FETCH_AND_SAVE_UPNP_BIN, {});
