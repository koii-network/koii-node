import config from 'config';
import sendMessage from 'preload/sendMessage';

export const finishNetworkMigration = () =>
  sendMessage(config.endpoints.FINISH_NETWORK_MIGRATION, {});
