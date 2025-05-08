import config from 'config';
import sendMessage from 'preload/sendMessage';

export const purgeNotifications = async (): Promise<void> => {
  return sendMessage(config.endpoints.PURGE_NOTIFICATIONS, {});
};
