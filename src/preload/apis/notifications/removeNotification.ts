import config from 'config';
import { RemoveNotificationPayload } from 'models/api/notifications/type';
import sendMessage from 'preload/sendMessage';

export const removeNotification = async (
  payload: RemoveNotificationPayload
): Promise<void> => {
  return sendMessage(config.endpoints.REMOVE_NOTIFICATION, payload);
};
