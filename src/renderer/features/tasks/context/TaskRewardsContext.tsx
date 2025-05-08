import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQuery } from 'react-query';

import { get } from 'lodash';
import { useAverageSlotTime } from 'renderer/features/common';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { getCurrentSlot, QueryKeys } from 'renderer/services';

interface TaskRewardState {
  initialRenderTime: number;
  lastCalculatedTime: number;
  lastCalculatedRewards: number;
  progressPercentage: number;
  initialCurrentSlot: number;
  pendingRewards: number;
}

interface TaskRewardsContextType {
  taskRewards: Record<string, TaskRewardState>;
  currentSlot: number | undefined;
  averageSlotTime: number | undefined;
  initializeTaskRewards: (taskId: string, pendingRewards: number) => void;
  updateTaskRewards: (
    taskId: string,
    rewards: number,
    progressPercentage: number
  ) => void;
}

const TaskRewardsContext = createContext<TaskRewardsContextType | undefined>(
  undefined
);

export function TaskRewardsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userConfig } = useUserAppConfig({});
  const shouldHideRewardsBar = get(userConfig, 'hideRewardsBar', false);

  const { data: currentSlot } = useQuery({
    queryKey: [QueryKeys.CurrentSlot],
    queryFn: getCurrentSlot,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    onSuccess: (newSlot) => {
      // Reset task rewards state when slot changes
      setTaskRewards((prev) => {
        const now = Date.now();
        return Object.fromEntries(
          Object.entries(prev).map(([taskId, state]) => [
            taskId,
            {
              ...state,
              initialRenderTime: now,
              lastCalculatedTime: now,
              initialCurrentSlot: newSlot || 56002547,
            },
          ])
        );
      });
    },
  });

  const { data: averageSlotTime } = useAverageSlotTime({
    enabled: !shouldHideRewardsBar,
  });

  const [taskRewards, setTaskRewards] = useState<
    Record<string, TaskRewardState>
  >({});

  const initializeTaskRewards = useCallback(
    (taskId: string, pendingRewards: number) => {
      if (shouldHideRewardsBar) return;
      setTaskRewards((prev) => {
        if (!prev[taskId]) {
          const now = Date.now();
          return {
            ...prev,
            [taskId]: {
              initialRenderTime: now,
              lastCalculatedTime: now,
              lastCalculatedRewards: pendingRewards,
              progressPercentage: 0,
              initialCurrentSlot: currentSlot || 56002547,
              pendingRewards,
            },
          };
        }
        return prev;
      });
    },
    [currentSlot, shouldHideRewardsBar]
  );

  const updateTaskRewards = useCallback(
    (taskId: string, rewards: number, progressPercentage: number) => {
      setTaskRewards((prev) => ({
        ...prev,
        [taskId]: prev[taskId]
          ? {
              ...prev[taskId],
              lastCalculatedTime: Date.now(),
              lastCalculatedRewards: rewards,
              progressPercentage,
            }
          : prev[taskId],
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      taskRewards: shouldHideRewardsBar ? {} : taskRewards,
      currentSlot: shouldHideRewardsBar ? undefined : currentSlot,
      averageSlotTime: shouldHideRewardsBar ? undefined : averageSlotTime,
      initializeTaskRewards,
      updateTaskRewards,
    }),
    [
      taskRewards,
      currentSlot,
      averageSlotTime,
      initializeTaskRewards,
      updateTaskRewards,
      shouldHideRewardsBar,
    ]
  );

  return (
    <TaskRewardsContext.Provider value={value}>
      {children}
    </TaskRewardsContext.Provider>
  );
}

export function useTaskRewardsContext() {
  const context = useContext(TaskRewardsContext);
  if (!context) {
    throw new Error('useTaskRewards must be used within a TaskRewardsProvider');
  }
  return context;
}
