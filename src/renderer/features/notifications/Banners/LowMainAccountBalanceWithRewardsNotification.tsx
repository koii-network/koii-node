/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function LowMainAccountBalanceWithRewardsNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const claimRewardsButton = document.getElementById('claim-rewards-button');

  const { markAsRead } = useNotificationActions();

  const handleClaimRewards = () => {
    markAsRead(notification.id);
    claimRewardsButton?.click();
  };

  return (
    <NotificationDisplayBanner
      BackButtonSlot={BackButtonSlot}
      notification={notification}
      messageSlot={
        <div className="">
          Your main key's funds are getting low. Claim some rewards to make sure
          your node keeps running tasks and making submissions.
        </div>
      }
      actionButtonSlot={
        <button
          onClick={handleClaimRewards}
          className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Claim Rewards
        </button>
      }
    />
  );
}
