import { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import {
  CRITICAL_MAIN_ACCOUNT_BALANCE,
  LOW_MAIN_ACCOUNT_BALANCE,
} from 'config/node';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import { QueryKeys } from 'renderer/services';

import { useAccountBalance } from './useAccountBalance';
import { useMainAccount } from './useMainAccount';

export const useLowMainAccountBalanceWarnings = () => {
  const { data: mainAccount } = useMainAccount();
  const { accountBalance: mainAccountBalance, loadingAccountBalance } =
    useAccountBalance(mainAccount);
  const queryCache = useQueryClient();
  const tasksCache = queryCache.getQueryData<any>(QueryKeys.TaskList);
  const nodeInfoCache = queryCache.getQueryData<any>(QueryKeys.taskNodeInfo);
  const tasks = tasksCache?.pages?.[0]?.content;
  const hasRewardsToClaim = !!nodeInfoCache?.pendingRewards;
  const nodeHasTasksStarted = !!tasks?.length;

  const { addAppNotification: showLowMainKeyBalanceNotification } =
    useAppNotifications('TOP_UP_MAIN_KEY');
  const { addAppNotification: showCriticalMainKeyBalanceNotification } =
    useAppNotifications('TOP_UP_MAIN_KEY_CRITICAL');
  const { addAppNotification: showLowMainKeyBalanceWithRewardsNotification } =
    useAppNotifications('TOP_UP_MAIN_KEY_WITH_REWARDS');
  const {
    addAppNotification: showCriticalMainKeyBalanceWithRewardsNotification,
  } = useAppNotifications('TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS');

  useEffect(() => {
    if (loadingAccountBalance || !nodeHasTasksStarted) return;

    const displayCriticalMainBalanceAlert =
      (mainAccountBalance ?? 0) <= CRITICAL_MAIN_ACCOUNT_BALANCE;
    const displayLowMainBalanceAlert =
      (mainAccountBalance ?? 0) <= LOW_MAIN_ACCOUNT_BALANCE;

    if (displayCriticalMainBalanceAlert) {
      const criticalMainBalanceNotificationShown = sessionStorage.getItem(
        'criticalMainBalanceNotificationShown'
      );
      if (criticalMainBalanceNotificationShown !== 'true') {
        const showNotification = hasRewardsToClaim
          ? showCriticalMainKeyBalanceWithRewardsNotification
          : showCriticalMainKeyBalanceNotification;
        showNotification();
      }
      sessionStorage.setItem('criticalMainBalanceNotificationShown', 'true');
    } else if (displayLowMainBalanceAlert) {
      const lowMainBalanceNotificationShown = sessionStorage.getItem(
        'lowMainBalanceNotificationShown'
      );
      if (lowMainBalanceNotificationShown !== 'true') {
        const showNotification = hasRewardsToClaim
          ? showLowMainKeyBalanceWithRewardsNotification
          : showLowMainKeyBalanceNotification;
        showNotification();
      }
      sessionStorage.setItem('lowMainBalanceNotificationShown', 'true');
    }
  }, [loadingAccountBalance, showLowMainKeyBalanceNotification]);
};
