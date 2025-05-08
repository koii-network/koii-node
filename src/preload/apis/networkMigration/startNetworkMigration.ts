import config from 'config';
import sendMessage from 'preload/sendMessage';
import { NetworkUrlType } from 'renderer/features/shared/constants';

export const startNetworkMigration = (payload: NetworkUrlType) =>
  sendMessage(config.endpoints.START_NETWORK_MIGRATION, payload);
