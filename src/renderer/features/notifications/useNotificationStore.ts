import { create } from 'zustand';

import {
  getNotificationsFromDb,
  purgeNotificationsFromDb,
  removeNotificationFromDb,
  saveNotificationToDb,
  updateNotificationInDb,
} from 'renderer/services';

import { NotificationType } from './types';

interface NotificationState {
  notifications: NotificationType[];
  actions: {
    addNotification: (notification: NotificationType) => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAsDismissed: (id: string) => Promise<void>;
    fetchNotifications: () => Promise<void>;
    purgeNotifications: () => Promise<void>;
  };
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  actions: {
    addNotification: async (notification) => {
      set((state) => ({
        notifications: [...state.notifications, notification],
      }));

      await saveNotificationToDb(notification);
    },
    removeNotification: async (id) => {
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id
        ),
      }));
      await removeNotificationFromDb(id);
    },
    markAsRead: async (id) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        ),
      }));
      await updateNotificationInDb(id, { read: true });
    },
    markAsDismissed: async (id) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, dismissed: true }
            : notification
        ),
      }));
      await updateNotificationInDb(id, { dismissed: true });
    },
    purgeNotifications: async () => {
      set(() => ({
        notifications: [],
      }));
      await purgeNotificationsFromDb();
    },
    fetchNotifications: async () => {
      try {
        const notifications = await getNotificationsFromDb();
        set({ notifications });
      } catch (error) {
        console.error(error);
      }
    },
  },
}));

// fetch notifications from DB on store initialization
useNotificationStore.getState().actions.fetchNotifications();

export const useNotificationActions = () => {
  const actions = useNotificationStore((state) => state.actions);
  return actions;
};
