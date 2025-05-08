import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { BONUS_TASK_NAME } from 'config/node';
import { TaskNotificationPayloadType } from 'preload/apis/tasks/onTaskNotificationReceived';
import { useRecoverStakingAccount } from 'renderer/features/common/hooks/useRecoverStakingAccount';
import { openBrowserWindow } from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';
// eslint-disable-next-line @cspell/spellchecker
import { v4 as uuidv4 } from 'uuid';

import { useFundNewAccountModal, useRunExemptionFlowModal } from '../../common';
import { useFundStakingAccountModal } from '../../common/hooks/useFundStakingAccountModal';
import { useMainAccount } from '../../settings/hooks/useMainAccount';
import { AppNotificationsMap } from '../appNotificationsMap';
import { BONUS_TASK_EVENT, sleep } from '../Banners/RunBonusTaskNotification';
import { getNotificationVariantFromLogLevel } from '../helpers/getNotificationVariantFromLogLevel';
import { AppUpdateButton } from '../NotificationsCenter/components/AppUpdateButton';
import { CTAButton } from '../NotificationsCenter/components/CTAButton';
import { renderCustomToast } from '../toasts/CustomToast';
import { AppNotificationType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { useFirstNodeRewardLogic } from './useFirstNodeRewardLogic';

export const useAppNotifications = (
  notificationTypeName: AppNotificationType
) => {
  const { addNotification, removeNotification, markAsRead } =
    useNotificationActions();
  const { data: mainAccount = '' } = useMainAccount();
  const { showModal: showFundMainAccountModal } = useFundNewAccountModal();
  const { showModal: showFundStakingAccountModal } =
    useFundStakingAccountModal();
  const { showModal: showExemptionFlowModal } = useRunExemptionFlowModal();
  const { handleSeeTasksAction } = useFirstNodeRewardLogic();
  const navigate = useNavigate();

  const { showModal: showRecoverStakingAccountModal } =
    useRecoverStakingAccount({ isKPLStakingAccount: false });
  const { showModal: showRecoverKPLStakingAccountModal } =
    useRecoverStakingAccount({ isKPLStakingAccount: true });

  const getNotificationActionComponent = (notification: NotificationType) => {
    const componentsMap: Record<AppNotificationType, JSX.Element> = {
      FIRST_TASK_RUNNING: (
        <CTAButton
          label="Run more Tasks"
          onClick={() => {
            navigate(AppRoute.AddTask);
            markAsRead(notification.id);
          }}
        />
      ),
      REFERRAL_PROGRAM: (
        <CTAButton
          label="Learn more"
          onClick={() => {
            navigate(AppRoute.Referral);
            markAsRead(notification.id);
          }}
        />
      ),
      TOP_UP_MAIN_KEY: (
        <CTAButton
          label="Top Up Main Key"
          onClick={() => {
            showFundMainAccountModal();
            markAsRead(notification.id);
          }}
        />
      ),
      TOP_UP_MAIN_KEY_CRITICAL: (
        <CTAButton
          label="Top Up Main Key"
          onClick={() => {
            showFundMainAccountModal();
            markAsRead(notification.id);
          }}
        />
      ),
      TOP_UP_MAIN_KEY_WITH_REWARDS: (
        <CTAButton
          label="Claim some Rewards"
          onClick={() => {
            const claimRewardsButton = document.getElementById(
              'claim-rewards-button'
            );
            claimRewardsButton?.click();
            markAsRead(notification.id);
          }}
        />
      ),
      TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS: (
        <CTAButton
          label="Claim some Rewards"
          onClick={() => {
            const claimRewardsButton = document.getElementById(
              'claim-rewards-button'
            );
            claimRewardsButton?.click();
            markAsRead(notification.id);
          }}
        />
      ),
      TOP_UP_STAKING_KEY: (
        <CTAButton
          label="Top Up Staking Key"
          onClick={() => {
            markAsRead(notification.id);
            showFundStakingAccountModal();
          }}
        />
      ),
      TOP_UP_STAKING_KEY_CRITICAL: (
        <CTAButton
          label="Top Up Staking Key"
          onClick={() => {
            showFundStakingAccountModal();
            markAsRead(notification.id);
          }}
        />
      ),
      RUN_EXEMPTION_FLOW: (
        <CTAButton
          label="Rent Exemption Flow"
          onClick={() => {
            showExemptionFlowModal();
            markAsRead(notification.id);
          }}
        />
      ),
      FIRST_NODE_REWARD: (
        <CTAButton
          label="See tasks"
          onClick={() => {
            handleSeeTasksAction(notification.id);
          }}
        />
      ),
      RUN_BONUS_TASK: (
        <CTAButton
          label="Run Bonus Task"
          onClick={async () => {
            navigate(AppRoute.AddTask);
            await sleep(1000);
            window.dispatchEvent(
              new CustomEvent(BONUS_TASK_EVENT, {
                detail: { taskName: BONUS_TASK_NAME },
              })
            );
            markAsRead(notification.id);
          }}
        />
      ),
      TASK_UPGRADE: (
        <CTAButton
          label="Upgrade in My Node"
          onClick={() => {
            navigate(AppRoute.MyNode);
            markAsRead(notification.id);
          }}
        />
      ),
      STAKING_KEY_MESSED_UP: (
        <CTAButton
          label="Recover staking key"
          onClick={() => {
            markAsRead(notification.id);
            showRecoverStakingAccountModal();
          }}
        />
      ),
      KPL_STAKING_KEY_MESSED_UP: (
        <CTAButton
          label="Recover KPL staking key"
          onClick={() => {
            markAsRead(notification.id);
            showRecoverKPLStakingAccountModal();
          }}
        />
      ),
      TASK_NOTIFICATION: (
        <CTAButton
          label="Go to Tasks"
          onClick={() => {
            navigate(AppRoute.MyNode);
            markAsRead(notification.id);
          }}
        />
      ),
      NEW_TASK_AVAILABLE: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      TASK_BLACKLISTED_OR_REMOVED: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      TASK_OUT_OF_BOUNTY: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      BACKUP_SEED_PHRASE: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      COMPUTER_MAX_CAPACITY: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      CLAIMED_REWARD: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      FIRST_REWARD_ON_NEW_TASK: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      UPDATE_AVAILABLE: <AppUpdateButton notificationId={notification.id} />,
      ARCHIVING_SUCCESSFUL: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      SESSION_STARTED_FROM_SCHEDULER: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      TASK_STARTED: (
        <CTAButton
          label="implement me"
          onClick={() => {
            throw new Error('Function not implemented.');
          }}
        />
      ),
      EXTERNAL_INFO: (
        <CTAButton
          label={notification.ctaText ?? 'Learn more'}
          onClick={() => {
            if (notification?.ctaLink) {
              openBrowserWindow(notification.ctaLink);
              markAsRead(notification.id);
            }
          }}
        />
      ),
      EXTERNAL_OFFER: (
        <CTAButton
          label={notification.ctaText ?? 'Learn more'}
          onClick={() => {
            if (notification.ctaLink) {
              openBrowserWindow(notification.ctaLink);
              markAsRead(notification.id);
            }
          }}
        />
      ),
      EXECUTABLE_MODIFIED_WARNING: <span />,
    };

    return notification.appNotificationDataKey
      ? componentsMap[notification.appNotificationDataKey]
      : null;
  };

  const notificationData = useMemo(
    () => AppNotificationsMap[notificationTypeName],
    [notificationTypeName]
  );

  if (!notificationData) {
    console.error(
      `No notification data found for notification type ${notificationTypeName}`
    );
  }

  function addAppNotification(metadata?: Record<string, unknown>) {
    const notification: NotificationType = {
      id: uuidv4(),
      date: Date.now(),
      read: false,
      dismissed: false,
      accountPubKey: mainAccount ?? '',
      appNotificationDataKey: notificationTypeName,
      variant: notificationData.variant ?? 'INFO',
      metadata,
    };

    if (!mainAccount) return;
    addNotification(notification);
  }

  function showTaskNotificationToast(
    taskNotificationData: TaskNotificationPayloadType,
    notificationId: string
  ) {
    const content = (
      <div className="flex flex-col gap-1">
        <div>{taskNotificationData.message}</div>
        {taskNotificationData.action && (
          <div>{taskNotificationData.action}</div>
        )}
      </div>
    );

    const variant = taskNotificationData.level === 'error' ? 'error' : 'info';

    const dismissable = taskNotificationData.level === 'error';

    renderCustomToast({
      content,
      dismissable,
      variant,
      onClose: () => markAsRead(notificationId),
    });
  }

  function addTaskNotification(
    taskNotificationData: TaskNotificationPayloadType
  ) {
    const showBanner =
      taskNotificationData.level === 'error' && !!taskNotificationData.action;

    const notification: NotificationType = {
      id: uuidv4(),
      date: Date.now(),
      read: false,
      dismissed: false,
      accountPubKey: mainAccount ?? '',
      appNotificationDataKey: notificationTypeName,
      variant: getNotificationVariantFromLogLevel(taskNotificationData.level),
      metadata: taskNotificationData,
      hideBanner: !showBanner,
    };

    /**
     * Show a toast notification for all task notifications except for errors with action
     * for errors, we will show a banner notification
     */
    const showToast = taskNotificationData.level !== 'error' || !showBanner;

    if (showToast) {
      showTaskNotificationToast(taskNotificationData, notification.id);
    }

    addNotification(notification);
  }

  return {
    markAsRead,
    addAppNotification,
    addTaskNotification,
    removeNotification,
    notificationDetails: notificationData,
    getNotificationActionComponent,
  };
};
