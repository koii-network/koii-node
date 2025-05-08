/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { openBrowserWindow } from 'renderer/services';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function ExternalNotificationBanner({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { markAsRead } = useNotificationActions();

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={<div className="">{notification?.customMessage}</div>}
      actionButtonSlot={
        <div className="flex items-center gap-6 w-max">
          <button
            className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
            onClick={() => {
              if (notification?.ctaLink) {
                openBrowserWindow(notification.ctaLink);
                markAsRead(notification.id);
              }
            }}
          >
            {notification.ctaText}
          </button>
        </div>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
