import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoute } from 'renderer/types/routes';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function ReferralProgramNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationActions();

  const onCTAClick = () => {
    navigate(AppRoute.Referral);
    markAsRead(notification.id);
  };

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={
        <div className="">
          Refer a friend and win 5 extra tokens for each person who joins the
          network.
        </div>
      }
      actionButtonSlot={
        <button
          onClick={onCTAClick}
          className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Get the Code
        </button>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
