import React from 'react';

import { Status } from 'renderer/components/ui/Table/Status';
import { TaskStatus } from 'renderer/types/task';

import { RewardsProgressBar } from './RewardsProgressBar';

export function StatusBar({
  status,
  isLoading,
  isRunning,
  taskId,
  nextReward,
  roundTime,
  startingSlot,
  tokenSymbol,
  pendingRewards,
  onClick,
  taskName,
  isPrivate,
  isBonusTask,
  isBountyEmpty,
}: {
  status: TaskStatus;
  isLoading: boolean;
  isRunning: boolean;
  taskId: string;
  nextReward: number;
  roundTime: number;
  startingSlot?: number;
  tokenSymbol: string;
  pendingRewards?: number;
  onClick?: () => void;
  taskName?: string;
  isPrivate?: boolean;
  isBonusTask?: boolean;
  isBountyEmpty?: boolean;
}) {
  return (
    <button
      data-accordion-trigger="status-bar"
      className="relative flex items-center gap-3 min-w-[150px] w-full 2xl:pr-6"
      onClick={onClick}
    >
      <div className="relative w-full flex items-center gap-3 cursor-auto">
        <Status status={status} isLoading={isLoading} isRunning={isRunning} />
        <RewardsProgressBar
          taskId={taskId}
          nextReward={nextReward}
          roundTime={roundTime}
          startingSlot={startingSlot}
          isRunning={isRunning}
          tokenSymbol={tokenSymbol}
          status={status}
          pendingRewards={pendingRewards}
          taskName={taskName}
          isPrivate={isPrivate}
          isBonusTask={isBonusTask}
          isBountyEmpty={isBountyEmpty}
        />
      </div>
    </button>
  );
}
