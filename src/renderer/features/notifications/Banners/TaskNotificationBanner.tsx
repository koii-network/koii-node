/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { TaskNotificationPayloadType } from 'preload/apis/tasks/onTaskNotificationReceived';
import { AppRoute } from 'renderer/types/routes';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function TaskNotificationBanner({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { markAsRead } = useNotificationActions();
  const navigate = useNavigate();
  const notificationMetadata =
    notification.metadata as TaskNotificationPayloadType;
  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={<div className="">{notificationMetadata.message}</div>}
      variant={notification.variant}
      actionButtonSlot={
        <div className="flex items-center gap-6 w-max">
          <button
            className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
            onClick={() => {
              navigate(AppRoute.MyNode);
              markAsRead(notification.id);
            }}
          >
            Go to your tasks
          </button>
        </div>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
