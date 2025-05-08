import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { RemoveNotificationPayload } from 'models/api/notifications/type';

import { getNotificationsFromStore } from './getNotificationsFromStore';

export const removeNotification = async (
  event: Event,
  payload: RemoveNotificationPayload
): Promise<void> => {
  const { notificationId } = payload;

  try {
    const notifications = await getNotificationsFromStore();

    if (
      !notifications.find((notification) => notification.id === notificationId)
    ) {
      throw new Error("Notification doesn't exists");
    }

    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationId
    );

    await namespaceInstance.storeSet(
      SystemDbKeys.Notifications,
      JSON.stringify(updatedNotifications)
    );
  } catch (err) {
    console.error('Error in removeNotification:', err);
    throw err;
  }
};
