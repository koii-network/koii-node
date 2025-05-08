import React, { useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { Outlet, useLocation } from 'react-router-dom';

import {
  QueryKeys,
  startAllTasks,
  startTask,
  stopAllTasks,
  stopTask,
} from 'renderer/services';

import { MainLayout } from './components';
import { useLowStakingAccountBalanceWarnings } from './features';
import { useK2ConnectionErrorListener } from './features/network/hooks/useK2ConnectionErrorListener';
import { useAppNotifications } from './features/notifications/hooks/useAppNotifications';
import { OnboardingLayout } from './features/onboarding/components/OnboardingLayout';
import { OnboardingProvider } from './features/onboarding/context/onboarding-context';
import { OrcaProvider } from './features/orca/context/orca-context';
import { useLowMainAccountBalanceWarnings } from './features/settings/hooks/useLowMainAccountBalanceWarnings';
import { useStakingAccountRecoveryFlow } from './features/settings/hooks/useStakingAccountRecoveryFlow';
import {
  MyNodeProvider,
  StartingTasksProvider,
  useTaskNotifications,
} from './features/tasks';
import { TaskRewardsProvider } from './features/tasks/context/TaskRewardsContext';
import { UpgradeTasksProvider } from './features/tasks/context/upgrade-tasks-context';
import {
  PaginatedStartedTasksData,
  getTaskBasedOnAuditProgram,
} from './utils/helpers';

const EXECUTABLE_NOTIFICATION_COOLDOWN = 60000;
const recentlyNotifiedFiles = new Map<string, number>();

function AppWrapper(): JSX.Element {
  const queryClient = useQueryClient();

  const { addAppNotification: showCriticalStakingKeyBalanceNotification } =
    useAppNotifications('TOP_UP_STAKING_KEY_CRITICAL');
  const { addAppNotification: addUpdateAvailableNotification } =
    useAppNotifications('UPDATE_AVAILABLE');
  const { addAppNotification: addExecutableModifiedNotification } =
    useAppNotifications('EXECUTABLE_MODIFIED_WARNING');
  useLowMainAccountBalanceWarnings();
  useLowStakingAccountBalanceWarnings({
    showCriticalBalanceNotification: showCriticalStakingKeyBalanceNotification,
  });
  useStakingAccountRecoveryFlow({});
  useStakingAccountRecoveryFlow({ isKPLStakingAccount: true });
  const { addTaskNotification } = useAppNotifications('TASK_NOTIFICATION');

  const location = useLocation();

  const isOnboarding = useMemo(
    () => location.pathname.includes('onboarding'),
    [location]
  );

  useEffect(() => {
    const destroy = window.main.onAppUpdate(() => {
      addUpdateAvailableNotification();
    });

    return () => {
      destroy();
    };
  }, [addUpdateAvailableNotification]);

  useEffect(() => {
    const destroy = window.main.onTaskExecutableFileChange(
      async (_, data: { file: string }) => {
        const now = Date.now();
        const lastNotified = recentlyNotifiedFiles.get(data.file);
        const hasAlreadyBeenNotifiedRecently =
          lastNotified && now - lastNotified < EXECUTABLE_NOTIFICATION_COOLDOWN;

        if (hasAlreadyBeenNotifiedRecently) return;

        recentlyNotifiedFiles.set(data.file, now);
        const taskAuditProgramId = data.file.split('.')[0];
        const startedTasksFromCache = queryClient.getQueryData(
          QueryKeys.TaskList
        ) as PaginatedStartedTasksData;

        const { taskId, taskName } = await getTaskBasedOnAuditProgram(
          taskAuditProgramId,
          startedTasksFromCache
        );
        addExecutableModifiedNotification({ taskId, taskName });
        try {
          if (taskId) {
            await stopTask(taskId);
            await queryClient.invalidateQueries([QueryKeys.TaskList]);
            await startTask(taskId);
            queryClient.invalidateQueries([QueryKeys.TaskList]);
          } else {
            await stopAllTasks();
            await queryClient.invalidateQueries([QueryKeys.TaskList]);
            await startAllTasks();
            queryClient.invalidateQueries([QueryKeys.TaskList]);
          }
        } catch (error) {
          console.error('Failed to stop or start task:', error);
        }
      }
    );

    return () => {
      destroy();
    };
  }, [addExecutableModifiedNotification, queryClient]);

  useTaskNotifications({ onTaskNotificationReceived: addTaskNotification });

  useK2ConnectionErrorListener();

  if (!isOnboarding) {
    return (
      <StartingTasksProvider>
        <MyNodeProvider>
          <TaskRewardsProvider>
            <UpgradeTasksProvider>
              <OrcaProvider>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </OrcaProvider>
            </UpgradeTasksProvider>
          </TaskRewardsProvider>
        </MyNodeProvider>
      </StartingTasksProvider>
    );
  }

  return (
    <OnboardingProvider>
      <OnboardingLayout>
        <Outlet />
      </OnboardingLayout>
    </OnboardingProvider>
  );
}

export default AppWrapper;
