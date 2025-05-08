/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { BackButtonSlotType, NotificationType } from '../types';

import { FundStakingAccountButton } from './components/FundStakingAccountButton';
import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function LowStakingAccountBalanceNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  return (
    <NotificationDisplayBanner
      BackButtonSlot={BackButtonSlot}
      notification={notification}
      messageSlot={
        <div className="">
          Your staking key's funds are getting low. Top up now to make sure your
          node is safe.
        </div>
      }
      actionButtonSlot={
        <FundStakingAccountButton notificationId={notification.id} />
      }
    />
  );
}
