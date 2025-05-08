import React from 'react';
import { twMerge } from 'tailwind-merge';

import { NotificationVariantType } from '../../types';

type PropsType = {
  notificationType: NotificationVariantType;
  isRead: boolean;
};

export function NotificationStatusIndicator({
  notificationType,
  isRead,
}: PropsType) {
  const classes = twMerge(
    'w-3 h-3 rounded-full border',
    notificationType === 'ERROR' && 'bg-finnieRed border-finnieRed',
    notificationType === 'WARNING' && 'bg-finnieOrange border-finnieOrange',
    notificationType === 'SUCCESS' &&
      'bg-finnieEmerald-light border-finnieEmerald-light',
    notificationType === 'INFO' && 'bg-finnieTeal border-finnieTeal',
    isRead && 'bg-transparent'
  );
  return <div className={classes} />;
}
