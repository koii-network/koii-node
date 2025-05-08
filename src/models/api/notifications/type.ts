import { NotificationType } from 'renderer/features/notifications/types';

export type GetNotificationsResponse = NotificationType[];
export type StoreNotificationPayload = {
  notificationData: NotificationType;
};
export type RemoveNotificationPayload = {
  notificationId: string;
};
export type UpdateNotificationPayload = {
  notificationId: string;
  notificationData: Partial<NotificationType>;
};
