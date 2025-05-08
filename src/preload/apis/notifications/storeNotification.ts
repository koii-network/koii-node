import config from 'config';
import { StoreNotificationPayload } from 'models/api/notifications/type';
import sendMessage from 'preload/sendMessage';

export const storeNotification = async (
  payload: StoreNotificationPayload
): Promise<void> => {
  return sendMessage(config.endpoints.STORE_NOTIFICATION, payload);
};
