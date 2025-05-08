import React from 'react';

import { ExternalNotificationBanner } from '../Banners/ExternalNotificationBanner';
import { FirstNodeReward } from '../Banners/FirstNodeRewardBanner';
import { FirstTaskRunningNotification } from '../Banners/FirstTasksRunningNotification';
import { KPLStakingKeyMessedUpNotification } from '../Banners/KPLStakingKeyMessedUpNotification';
import { LowMainAccountBalanceNotification } from '../Banners/LowMainAccountBalanceNotification';
import { LowMainAccountBalanceSevereNotification } from '../Banners/LowMainAccountBalanceSevereNotification';
import { LowMainAccountBalanceSevereWithRewardsNotification } from '../Banners/LowMainAccountBalanceSevereWithRewardsNotification';
import { LowMainAccountBalanceWithRewardsNotification } from '../Banners/LowMainAccountBalanceWithRewardsNotification';
import { LowStakingAccountBalanceNotification } from '../Banners/LowStakingAccountBalanceNotification';
import { LowStakingAccountBalanceSevereNotification } from '../Banners/LowStakingAccountBalanceSevereNotification';
import { ReferralProgramNotification } from '../Banners/ReferralProgramNotification';
import { RentExemptionFlowBanner } from '../Banners/RentExemptionFlowBanner';
import { RunBonusTaskNotification } from '../Banners/RunBonusTaskNotification';
import { StakingKeyMessedUpNotification } from '../Banners/StakingKeyMessedUpNotification';
import { TaskExecutableModifiedNotification } from '../Banners/TaskExecutableModifiedNotification';
import { TaskNotificationBanner } from '../Banners/TaskNotificationBanner';
import { TaskUpgradeNotificationBanner } from '../Banners/TaskUpgradeNotificationBanner';
import { UpdateAvailableNotification } from '../Banners/UpdateAvailableNotification';
import { AppNotificationType, NotificationType } from '../types';

export const useNotificationComponent = ({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: any;
}) => {
  const componentsMap: Record<AppNotificationType, JSX.Element | null> = {
    FIRST_NODE_REWARD: (
      <FirstNodeReward
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    RUN_BONUS_TASK: (
      <RunBonusTaskNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    FIRST_TASK_RUNNING: (
      <FirstTaskRunningNotification notification={notification} />
    ),
    REFERRAL_PROGRAM: (
      <ReferralProgramNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_MAIN_KEY: (
      <LowMainAccountBalanceNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_MAIN_KEY_CRITICAL: (
      <LowMainAccountBalanceSevereNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_MAIN_KEY_WITH_REWARDS: (
      <LowMainAccountBalanceWithRewardsNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS: (
      <LowMainAccountBalanceSevereWithRewardsNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_STAKING_KEY: (
      <LowStakingAccountBalanceNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TOP_UP_STAKING_KEY_CRITICAL: (
      <LowStakingAccountBalanceSevereNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    RUN_EXEMPTION_FLOW: (
      <RentExemptionFlowBanner
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    STAKING_KEY_MESSED_UP: (
      <StakingKeyMessedUpNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    KPL_STAKING_KEY_MESSED_UP: (
      <KPLStakingKeyMessedUpNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TASK_UPGRADE: (
      <TaskUpgradeNotificationBanner
        BackButtonSlot={BackButtonSlot}
        notification={notification}
        taskName={
          (notification?.metadata as { taskName: string })?.taskName ?? ''
        }
      />
    ),
    UPDATE_AVAILABLE: (
      <UpdateAvailableNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    EXECUTABLE_MODIFIED_WARNING: (
      <TaskExecutableModifiedNotification
        notification={notification}
        BackButtonSlot={BackButtonSlot}
        task={notification?.metadata as { taskId: string; taskName: string }}
      />
    ),
    EXTERNAL_INFO: (
      <ExternalNotificationBanner
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    EXTERNAL_OFFER: (
      <ExternalNotificationBanner
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    TASK_NOTIFICATION: (
      <TaskNotificationBanner
        notification={notification}
        BackButtonSlot={BackButtonSlot}
      />
    ),
    NEW_TASK_AVAILABLE: null,
    TASK_BLACKLISTED_OR_REMOVED: null,
    TASK_OUT_OF_BOUNTY: null,
    BACKUP_SEED_PHRASE: null,
    COMPUTER_MAX_CAPACITY: null,
    CLAIMED_REWARD: null,
    FIRST_REWARD_ON_NEW_TASK: null,
    ARCHIVING_SUCCESSFUL: null,
    TASK_STARTED: null,
    SESSION_STARTED_FROM_SCHEDULER: null,
  };

  return (
    notification.appNotificationDataKey &&
    componentsMap[notification.appNotificationDataKey]
  );
};
