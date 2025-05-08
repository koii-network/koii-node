import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { UpdateNotificationPayload } from 'models/api/notifications/type';

import { getNotificationsFromStore } from './getNotificationsFromStore';

export const updateNotification = async (
  event: Event,
  payload: UpdateNotificationPayload
): Promise<void> => {
  const { notificationId, notificationData } = payload;

  try {
    const notifications = await getNotificationsFromStore();

    const notificationIndex = notifications.findIndex(
      (notification) => notification.id === notificationId
    );

    if (notificationIndex === -1) {
      throw new Error("Notification doesn't exist");
    }

    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...notificationData,
    };

    await namespaceInstance.storeSet(
      SystemDbKeys.Notifications,
      JSON.stringify(notifications)
    );
  } catch (err) {
    console.error('Error in updateNotification:', err);
    throw err;
  }
};
