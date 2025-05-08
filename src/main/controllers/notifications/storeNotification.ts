import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { StoreNotificationPayload } from 'models/api/notifications/type';
import { NotificationType } from 'renderer/features/notifications/types';

import { getNotificationsFromStore } from './getNotificationsFromStore';

export const storeNotification = async (
  event: Event,
  payload: StoreNotificationPayload
): Promise<boolean> => {
  const currentNotifications = await getNotificationsFromStore();

  const { notificationData } = payload;

  const notificationToStore: NotificationType = {
    ...notificationData,
  };

  const notificationsToStore = [...currentNotifications, notificationToStore];

  try {
    await namespaceInstance.storeSet(
      SystemDbKeys.Notifications,
      JSON.stringify(notificationsToStore)
    );
    return true;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};
