import React from 'react';

import { useNotificationComponent } from './hooks/useNotificationComponent';
import { BackButtonSlotType, NotificationType } from './types';

type PropsType = {
  bottomNotifications: NotificationType[];
  BackButtonSlot?: BackButtonSlotType;
};

export function DisplayBottomNotifications({
  bottomNotifications,
  BackButtonSlot,
}: PropsType) {
  return (
    <div>
      {bottomNotifications.map((notification) => {
        return (
          <NotificationDisplay
            notification={notification}
            key={notification.id}
            BackButtonSlot={BackButtonSlot}
          />
        );
      })}
    </div>
  );
}

function NotificationDisplay({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: any;
}) {
  const Component = useNotificationComponent({ notification, BackButtonSlot });

  if (!Component) return null;

  return Component;
}
