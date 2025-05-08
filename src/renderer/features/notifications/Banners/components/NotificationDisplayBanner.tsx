import React from 'react';
import { twMerge } from 'tailwind-merge';

import {
  BackButtonSlotType,
  NotificationType,
  NotificationVariantType,
} from '../../types';
import { useNotificationActions } from '../../useNotificationStore';

const variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.2 } },
};

type PropsType = {
  notification: NotificationType;
  BackButtonSlot?: BackButtonSlotType;
  variant?: NotificationVariantType;
  onClose?: () => void;
  messageSlot?: React.ReactNode;
  actionButtonSlot?: React.ReactNode;
};
export function NotificationDisplayBanner({
  notification,
  BackButtonSlot,
  variant,
  onClose,
  messageSlot,
  actionButtonSlot,
}: PropsType) {
  const { markAsRead } = useNotificationActions();
  const handleClose = () => {
    markAsRead(notification.id);
    onClose?.();
  };

  const classNames = twMerge(
    'flex flex-col relative justify-between w-96 items-center gap-6 p-4 mb-1 z-10 transition-all duration-300 ease-in-out max-h-[196px]',
    // 'bg-green-2 text-white',
    ' text-white',
    notification.variant === 'ERROR' && '',
    notification.variant === 'WARNING' && '',
    notification.variant === 'SUCCESS' && '',
    notification.variant === 'INFO' && '',
    notification.variant === 'OFFER' && ''
  );

  return (
    <div className={classNames}>
      <div
        className={`flex justify-between items-start gap-2 w-[93%] mr-auto ${
          !actionButtonSlot && 'my-4'
        }`}
      >
        {messageSlot}
      </div>
      {actionButtonSlot && (
        <div className="flex gap-4  mr-auto">{actionButtonSlot}</div>
      )}
    </div>
  );
}
