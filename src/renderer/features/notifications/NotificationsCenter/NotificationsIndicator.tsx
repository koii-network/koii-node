import React, { useMemo } from 'react';

import { useNotificationStore } from '../useNotificationStore';

type PropsType = {
  children: React.ReactNode;
};

export function NotificationsIndicator({ children }: PropsType) {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications]
  );

  if (unreadNotifications.length === 0) {
    return <div className="inline-block">{children}</div>;
  }

  return (
    <div className="relative inline-block">
      {children}
      <span className="absolute bottom-auto left-auto -right-28 -top-1 z-10 inline-block -translate-y-1/2 translate-x-2/4 rotate-0 skew-x-0 skew-y-0 scale-x-100 scale-y-100 whitespace-nowrap rounded-full bg-finnieRed-500 px-2.5 py-1 text-center align-baseline text-xs font-bold leading-none text-white">
        {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
      </span>
    </div>
  );
}
