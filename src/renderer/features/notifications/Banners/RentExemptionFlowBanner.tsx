import React, { useCallback } from 'react';

import { useRunExemptionFlowModal } from 'renderer/features/common';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function RentExemptionFlowBanner({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { showModal: showExemptionFlowModal } = useRunExemptionFlowModal();
  const { markAsRead } = useNotificationActions();

  const handleLearnMoreClick = useCallback(() => {
    markAsRead(notification.id);
    showExemptionFlowModal();
  }, [markAsRead, notification.id, showExemptionFlowModal]);

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={
        <div className="">We sent a little bonus to your staking key.</div>
      }
      actionButtonSlot={
        <button
          onClick={handleLearnMoreClick}
          className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Learn more
        </button>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
