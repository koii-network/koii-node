/* eslint-disable @cspell/spellchecker */

import { NotificationType } from 'renderer/features/notifications/types';

export const saveNotificationToDb = async (
  notificationData: NotificationType
) => {
  window.main.storeNotification({ notificationData });
};
export const removeNotificationFromDb = async (id: string) => {
  return window.main.removeNotification({ notificationId: id });
};
export const updateNotificationInDb = async (
  id: string,
  updateData: Partial<Omit<NotificationType, 'id'>>
) => {
  return window.main.updateNotification({
    notificationId: id,
    notificationData: updateData,
  });
};

export const getNotificationsFromDb = async (): Promise<NotificationType[]> => {
  return window.main.getNotificationsFromStore();
};

export const purgeNotificationsFromDb = async () => {
  return window.main.purgeNotifications();
};

export const fetchExternalNotificationsFromAws = async () => {
  return window.main.fetchS3FolderContents({
    prefix: 'alerts',
    bucket: 'koii-node-notification',
  });
};
