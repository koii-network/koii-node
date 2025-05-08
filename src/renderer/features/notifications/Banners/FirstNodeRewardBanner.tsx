/* eslint-disable react/no-unescaped-entities */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRentExemptionFlow } from 'renderer/features/common/hooks/useRentExemptionFlow';
import { AppRoute } from 'renderer/types/routes';

import { useAppNotifications } from '../hooks';
import { BackButtonSlotType, NotificationType } from '../types';
// import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function FirstNodeReward({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const navigate = useNavigate();
  const { getStakingWalletAirdrop } = useRentExemptionFlow();

  const { addAppNotification: runExemptionFlowNotification, markAsRead } =
    useAppNotifications('RUN_EXEMPTION_FLOW');

  const handleShowRentExemptionFlowNotification = useCallback(async () => {
    await getStakingWalletAirdrop()
      .then((res) => {
        console.log(res.message);
        runExemptionFlowNotification();
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [getStakingWalletAirdrop, runExemptionFlowNotification]);

  const handleSeeTasksAction = useCallback(() => {
    markAsRead(notification.id);
    navigate(AppRoute.AddTask);
    handleShowRentExemptionFlowNotification();
  }, [
    handleShowRentExemptionFlowNotification,
    navigate,
    notification.id,
    markAsRead,
  ]);

  const handleClose = useCallback(() => {
    handleShowRentExemptionFlowNotification();
  }, [handleShowRentExemptionFlowNotification]);

  return (
    <NotificationDisplayBanner
      onClose={handleClose}
      notification={notification}
      messageSlot={
        <div className="">
          You've earned your first node reward! Run more tasks to easily
          increase your rewards.
        </div>
      }
      actionButtonSlot={
        <div className="flex items-center gap-6 w-max">
          <button
            onClick={handleSeeTasksAction}
            className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            See tasks
          </button>
        </div>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
