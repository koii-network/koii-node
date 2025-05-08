import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';

import { get } from 'lodash';
import { useUserAppConfig } from 'renderer/features/settings/hooks';

import { useTaskRewardsContext } from '../context/TaskRewardsContext';

export interface InitialProgressData {
  displayedEarnings: string;
  progressPercentage: number;
}

interface RewardsCalculation extends InitialProgressData {
  rewardPerSecond: number;
  timeRemaining: number;
}

interface UseRewardsPerSecondProps {
  taskId: string;
  nextReward: number;
  roundTimeInSeconds?: number;
  startingSlot?: number;
  averageSlotTime?: number;
  isRunning?: boolean;
  pendingRewards?: number;
}

export function useRewardsPerSecond({
  taskId,
  nextReward,
  roundTimeInSeconds = 0,
  startingSlot,
  isRunning,
  pendingRewards,
}: UseRewardsPerSecondProps) {
  const { taskRewards, initializeTaskRewards, averageSlotTime, currentSlot } =
    useTaskRewardsContext();

  const { userConfig } = useUserAppConfig({});

  const shouldHideRewardsBar = get(userConfig, 'hideRewardsBar', false);

  const constants = useMemo(() => {
    if (
      shouldHideRewardsBar ||
      !startingSlot ||
      !currentSlot ||
      !averageSlotTime ||
      !roundTimeInSeconds
    ) {
      return null;
    }

    const rewardPerSecond = nextReward / roundTimeInSeconds;
    const slotDifference = currentSlot - startingSlot;
    const initialTimeElapsed = (slotDifference * averageSlotTime) / 1000;

    return {
      rewardPerSecond,
      initialTimeElapsed: initialTimeElapsed % roundTimeInSeconds,
      initialRenderTime: Date.now(),
    };
  }, [
    nextReward,
    roundTimeInSeconds,
    startingSlot,
    currentSlot,
    averageSlotTime,
    shouldHideRewardsBar,
  ]);

  const calculateRewards = useCallback((): RewardsCalculation => {
    if (
      !isRunning ||
      !constants ||
      !roundTimeInSeconds ||
      shouldHideRewardsBar
    ) {
      return {
        displayedEarnings: '0.000000',
        rewardPerSecond: 0,
        progressPercentage: 0,
        timeRemaining: 0,
      };
    }

    const timeSinceRender = (Date.now() - constants.initialRenderTime) / 1000;
    const totalTimeElapsed =
      (constants.initialTimeElapsed + timeSinceRender) % roundTimeInSeconds;

    const currentEarnings = constants.rewardPerSecond * totalTimeElapsed;
    const progressPercentage = (totalTimeElapsed / roundTimeInSeconds) * 100;
    const timeRemaining = roundTimeInSeconds - totalTimeElapsed;
    const totalEarnings = (pendingRewards || 0) + currentEarnings;

    return {
      displayedEarnings: totalEarnings.toFixed(4),
      rewardPerSecond: constants.rewardPerSecond,
      progressPercentage,
      timeRemaining,
    };
  }, [
    constants,
    roundTimeInSeconds,
    isRunning,
    pendingRewards,
    shouldHideRewardsBar,
  ]);

  const {
    data = {
      displayedEarnings: '0.000000',
      rewardPerSecond: 0,
      progressPercentage: 0,
      timeRemaining: 0,
    },
    isLoading,
  } = useQuery<RewardsCalculation>({
    queryKey: ['rewards', taskId],
    queryFn: calculateRewards,
    enabled: !!isRunning && !!currentSlot && !!averageSlotTime,
    refetchInterval: 5000,
  });

  // Initialize task rewards data if not present
  useEffect(() => {
    if (isRunning && currentSlot && !taskRewards[taskId] && constants) {
      initializeTaskRewards(taskId, Number(data.displayedEarnings));
    }
  }, [
    taskId,
    currentSlot,
    isRunning,
    constants,
    data.displayedEarnings,
    taskRewards,
    initializeTaskRewards,
  ]);

  return { data, isLoading };
}
