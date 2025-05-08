/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { useFundNewAccountModal } from 'renderer/features/common';

import { BackButtonSlotType, NotificationType } from '../types';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function LowMainAccountBalanceNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { showModal: showFundMainAccountModal } = useFundNewAccountModal();

  return (
    <NotificationDisplayBanner
      BackButtonSlot={BackButtonSlot}
      notification={notification}
      messageSlot={
        <div className="">
          Your main key's funds are getting low. Top up now to make sure your
          node keeps running tasks and making submissions.
        </div>
      }
      actionButtonSlot={
        <button
          onClick={showFundMainAccountModal}
          className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Fund Now
        </button>
      }
    />
  );
}
