import config from 'config';
import sendMessage from 'preload/sendMessage';
import { NetworkUrlType } from 'renderer/features/shared/constants';

export default (payload: NetworkUrlType) =>
  sendMessage(config.endpoints.SWITCH_NETWORK, payload);
