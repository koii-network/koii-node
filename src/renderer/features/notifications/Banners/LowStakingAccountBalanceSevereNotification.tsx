/* eslint-disable react/no-unescaped-entities */
import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { QueryKeys, stopAllTasks } from 'renderer/services';

import { BackButtonSlotType, NotificationType } from '../types';

import { FundStakingAccountButton } from './components/FundStakingAccountButton';
import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function LowStakingAccountBalanceSevereNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const stopAllTasksAndUpdateMyNodeList = async () => {
      try {
        await stopAllTasks();
        queryClient.invalidateQueries([QueryKeys.TaskList]);
      } catch (error) {
        console.error('Failed to stop all tasks:', error);
      }
    };
    stopAllTasksAndUpdateMyNodeList();
  }, [queryClient]);

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={
        <div className="">
          Your staking key is below 1 KOII. Fund now to keep your node in the
          network.
        </div>
      }
      actionButtonSlot={
        <FundStakingAccountButton notificationId={notification.id} />
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}
