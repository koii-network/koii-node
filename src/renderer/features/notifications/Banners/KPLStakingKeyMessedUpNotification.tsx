/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { useRecoverStakingAccount } from 'renderer/features/common/hooks/useRecoverStakingAccount';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function KPLStakingKeyMessedUpNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { markAsRead } = useNotificationActions();

  const { showModal: showRecoverKPLStakingAccountModal } =
    useRecoverStakingAccount({ isKPLStakingAccount: true });

  const handleClickCTA = () => {
    markAsRead(notification.id);
    showRecoverKPLStakingAccountModal();
  };

  return (
    <NotificationDisplayBanner
      BackButtonSlot={BackButtonSlot}
      notification={notification}
      messageSlot={
        <div className="">
          Your KPL staking key ran out of funds for rent and got deleted by the
          network. Now it's not owned by the KPL Program as it should, and it
          won't be able to stake on KPL tasks. Recover it to continue running
          KPL tasks!
        </div>
      }
      actionButtonSlot={
        <button
          onClick={handleClickCTA}
          className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Recover KPL staking key
        </button>
      }
    />
  );
}
