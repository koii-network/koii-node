import * as Progress from '@radix-ui/react-progress';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SurpriseBoxes from 'assets/svgs/surprise-boxes.svg';
import { get } from 'lodash';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import {
  bonusTaskstatuses,
  statuses,
} from 'renderer/components/ui/Table/Status';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { useAnimatedCount } from 'renderer/hooks/useAnimatedCount';
import { TaskStatus } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { AppRoute } from 'renderer/types/routes';

import { useTaskRewardsContext } from '../context/TaskRewardsContext';
import { useRewardsPerSecond } from '../hooks/useRewardsPerSecond';

interface RewardsProgressBarProps {
  taskId: string;
  nextReward: number;
  roundTime: number;
  startingSlot?: number;
  isRunning?: boolean;
  tokenSymbol?: string;
  status?: TaskStatus;
  pendingRewards?: number;
  taskName?: string;
  isPrivate?: boolean;
  isBonusTask?: boolean;
  isBountyEmpty?: boolean;
}

export function RewardsProgressBar({
  taskId,
  nextReward,
  roundTime,
  startingSlot,
  isRunning,
  tokenSymbol,
  status,
  pendingRewards,
  taskName,
  isPrivate,
  isBonusTask,
  isBountyEmpty,
}: RewardsProgressBarProps) {
  const { taskRewards, currentSlot, averageSlotTime } = useTaskRewardsContext();
  const storedTaskData = taskRewards[taskId];

  const roundTimeInSeconds = averageSlotTime
    ? roundTime * (averageSlotTime / 1000)
    : undefined;

  // Show stored progress immediately while loading new data
  const initialProgress = storedTaskData
    ? {
        displayedEarnings: storedTaskData.lastCalculatedRewards.toFixed(5),
        progressPercentage: storedTaskData.progressPercentage,
      }
    : null;

  const isKplMiner = !isPrivate && taskName === 'KPL token Miner';

  const {
    data: { displayedEarnings, progressPercentage },
    isLoading: isRewardsPerSecondLoading,
  } = useRewardsPerSecond({
    taskId,
    nextReward: isKplMiner ? 0.2 : nextReward,
    roundTimeInSeconds,
    startingSlot,
    isRunning,
    pendingRewards,
  });

  const isLoading =
    !initialProgress &&
    (isRewardsPerSecondLoading ||
      !currentSlot ||
      !progressPercentage ||
      !roundTimeInSeconds ||
      !startingSlot);

  const barColor = isBonusTask
    ? `${bonusTaskstatuses[status!]?.bgColor || 'bg-finnieEmerald-light'}`
    : statuses[status!]?.bgColor || 'bg-finnieEmerald-light';

  const currentEarningsToDisplay = Number(
    displayedEarnings === '0.000000' ? 0 : displayedEarnings
  );

  const hasConnectionIssue =
    progressPercentage < 0 || currentEarningsToDisplay < 0;

  const getProgressPercentage = (rawPercentage: number) => {
    if (status === 'PRE_SUBMISSION') {
      return rawPercentage / 3; // Show 1/3 of actual progress
    }
    if (status === 'WARMING_UP') {
      return (rawPercentage * 2) / 3; // Show 2/3 of actual progress
    }
    return rawPercentage;
  };

  const getDisplayedEarnings = () => {
    // Split out pending rewards from current round earnings
    const pendingAmount = pendingRewards || 0;
    const currentRoundEarnings =
      Number(displayedEarnings === '0.000000' ? 0 : displayedEarnings) -
      pendingAmount;

    // Only apply the division to current round earnings
    let adjustedCurrentEarnings = currentRoundEarnings;
    if (status === 'PRE_SUBMISSION') {
      adjustedCurrentEarnings = currentRoundEarnings / 3;
    } else if (status === 'WARMING_UP') {
      adjustedCurrentEarnings = (currentRoundEarnings * 2) / 3;
    }

    // Add back the full pending rewards
    return pendingAmount + adjustedCurrentEarnings;
  };

  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const KPL_TOKENS = [
    'FIRE',
    <SurpriseBoxes key="surprise-box-1" className="h-fit w-10 m-auto mt-0.5" />,
    'BIRD',
    <SurpriseBoxes key="surprise-box-2" className="h-fit w-10 m-auto mt-0.5" />,
    'BBIG',
    <SurpriseBoxes key="surprise-box-3" className="h-fit w-10 m-auto mt-0.5" />,
    'ASTRO',
  ];

  useEffect(() => {
    if (isKplMiner) {
      const interval = setInterval(() => {
        setCurrentTokenIndex((prev) => (prev + 1) % KPL_TOKENS.length);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isKplMiner, KPL_TOKENS.length]);

  const animatedEarnings = useAnimatedCount(getDisplayedEarnings(), 5000);

  const isWarmingUp = status === 'WARMING_UP' || status === 'PRE_SUBMISSION';

  const { userConfig } = useUserAppConfig({});
  const shouldHideRewardsBar = get(userConfig, 'hideRewardsBar', false);

  const navigate = useNavigate();

  const navigateToSettings = () => {
    navigate(AppRoute.SettingsGeneral, {
      state: { highlightRewardsBar: true },
    });
  };

  const borderClass = isBonusTask
    ? 'shadow-[0_0_2px_2px_rgba(255,215,0,0.5)]'
    : '';

  if (shouldHideRewardsBar) {
    return (
      <div
        className={`w-full h-9 rounded-lg bg-rewards-progress flex items-center justify-between px-4 ${borderClass}`}
      >
        <button
          onClick={navigateToSettings}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-1 mx-auto"
        >
          <span>Enable in Settings</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  const isBonusTaskAndBountyEmpty = isBonusTask && isBountyEmpty;

  if (!isRunning || isBonusTaskAndBountyEmpty) {
    return (
      <div
        className={`w-full space-y-2 overflow-hidden rounded-lg ${
          isBonusTaskAndBountyEmpty
            ? 'shadow-[0_0_3px_3px_rgba(255,255,255,0.35)]'
            : borderClass
        }`}
      >
        <Progress.Root
          className={`relative h-9 w-full rounded-lg ${
            isBonusTaskAndBountyEmpty ? 'bg-[#000000]' : 'bg-rewards-progress'
          }`}
          value={100}
        >
          <div className="absolute h-full w-full overflow-hidden rounded-lg">
            <Progress.Indicator
              className={`h-full flex-1 ${
                isBonusTaskAndBountyEmpty
                  ? 'bg-gray-500 opacity-40'
                  : 'bg-gray-400 opacity-40'
              } transition-transform duration-[660ms] rounded-lg ease-[cubic-bezier(0.65, 0, 0.35, 1)]`}
              style={{ transform: 'translateX(0%)' }}
            />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="h-3 w-3 text-gray-600 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14m8-14v14" />
            </svg>
          </div>
          <span className="text-xs absolute right-0 left-0 text-center top-1/2 -translate-y-1/2 px-3 text-gray-300">
            {isBonusTask && isBountyEmpty
              ? 'Next Season Starts Soon!'
              : 'Start the task to earn'}
          </span>
        </Progress.Root>
      </div>
    );
  }

  if (isLoading || hasConnectionIssue) {
    return (
      <div className="w-full space-y-2 overflow-hidden">
        <Progress.Root
          className={`relative h-9 w-full rounded-lg bg-rewards-progress ${borderClass}`}
          value={0}
        >
          <div className="absolute h-full w-full overflow-hidden rounded-lg">
            <div className="absolute h-full w-20 animate-[shimmer_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-finnieEmerald-light/50 to-transparent" />
          </div>
          <span
            className="text-xs absolute right-0 left-0 text-center top-1/2 -translate-y-1/2 px-3 mix-blend-difference text-white"
            style={{ filter: 'grayscale(1) brightness(2)' }}
          >
            {hasConnectionIssue ? 'Reconnecting...' : 'Loading'}
          </span>
        </Progress.Root>
      </div>
    );
  }

  return (
    <Popover
      theme={Theme.Dark}
      tooltipContent={
        <div className="space-y-2 text-left">
          {isBonusTask ? (
            <div>
              <p>
                Earn more by running more tasks to increase your node&apos;s
                weight!
              </p>
            </div>
          ) : isKplMiner ? (
            <div>
              <p>
                Earn random KPL tokens airdropped directly to your system key.
              </p>
            </div>
          ) : (
            <p>
              These are estimated rewards for current round + unclaimed rewards.
            </p>
          )}
        </div>
      }
      asChild
    >
      <div className="w-full space-y-2 overflow-visible">
        <Progress.Root
          className={`relative h-9 w-full rounded-lg bg-rewards-progress ${borderClass}`}
          value={getProgressPercentage(progressPercentage)}
        >
          <div className="absolute h-full w-full overflow-hidden rounded-lg">
            <Progress.Indicator
              className={`h-full flex-1 ${barColor} transition-transform duration-[660ms] rounded-lg ease-[cubic-bezier(0.65, 0, 0.35, 1)] relative overflow-hidden ${
                isBonusTask ? 'shadow-[0_0_4px_4px_rgba(255,215,0,0.5)]' : ''
              }`}
              style={{
                transform: `translateX(-${
                  100 - getProgressPercentage(progressPercentage)
                }%)`,
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-end px-3">
            <span
              className="relative flex items-center text-[12.5px] mix-blend-difference text-white"
              style={{ filter: 'grayscale(1) brightness(2)' }}
            >
              {isBonusTask ? (
                <SurpriseBoxes className="w-11 h-fit mr-1 inline mix-blend-difference text-white" />
              ) : (
                animatedEarnings
              )}{' '}
              {isKplMiner ? (
                <span className="inline-block relative -mt-[3.5px] h-[16px] w-[50px] overflow-hidden">
                  {KPL_TOKENS.map((token, index) => (
                    <span
                      key={
                        typeof token === 'string'
                          ? token
                          : `surprise-box-${index}`
                      }
                      className="absolute left-0 top-0 bottom-0 my-auto w-full h-[16px] transition-transform duration-500 ease-in-out whitespace-nowrap"
                      style={{
                        transform: `translateY(${
                          (index - currentTokenIndex) * 100
                        }%)`,
                      }}
                    >
                      {token}
                    </span>
                  ))}
                </span>
              ) : (
                tokenSymbol
              )}
            </span>
          </div>
        </Progress.Root>
      </div>
    </Popover>
  );
}
