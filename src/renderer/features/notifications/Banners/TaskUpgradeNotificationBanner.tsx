import React from 'react';
import { useNavigate } from 'react-router-dom';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

interface Props {
  notification: NotificationType;
  taskName: string;
  BackButtonSlot: BackButtonSlotType;
}

export function TaskUpgradeNotificationBanner({
  notification,
  taskName,
  BackButtonSlot,
}: Props) {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationActions();

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={
        <div className="">{taskName} is now available to upgrade!</div>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
