import config from 'config';
import { UpdateNotificationPayload } from 'models/api/notifications/type';
import sendMessage from 'preload/sendMessage';

export const updateNotification = async (
  payload: UpdateNotificationPayload
): Promise<void> => {
  return sendMessage(config.endpoints.UPDATE_NOTIFICATION, payload);
};
