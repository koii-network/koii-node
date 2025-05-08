import { intervalToDuration } from 'date-fns';
import React from 'react';
import { InfiniteData } from 'react-query';

import { PaginatedResponse } from 'models';
import { Task } from 'renderer/types';

type GetTaskMessageParams = {
  taskIsDelistedAndStopped: boolean;
  task: Task;
  isBountyEmpty: boolean;
  myStakeInKoii: number;
  isRunning: boolean;
  minStake: number;
  isPrivate: boolean;
  isBonusTask: boolean;
};

export function getTaskMessage({
  taskIsDelistedAndStopped,
  task,
  isBountyEmpty,
  myStakeInKoii,
  isRunning,
  minStake,
  isPrivate,
  isBonusTask,
}: GetTaskMessageParams): string {
  if (taskIsDelistedAndStopped) {
    return "This task has been delisted, but don't worry! Your tokens are safe and will be ready to unstake after 3 rounds.";
  } else if (isBonusTask && isBountyEmpty) {
    return 'Next season of boosting your tasks with bonus rewards will start soon, stay tuned!';
  } else if (isBountyEmpty) {
    return 'This task is inactive because the bounty is empty. The creator needs to refill the bounty before you can run it again.';
  } else if (myStakeInKoii > 0) {
    return `${isRunning ? 'Stop' : 'Start'} task`;
  } else {
    return `You need to stake at least ${minStake} KOII on this task to run it.`;
  }
}

type GetTooltipContentParamsType = {
  isRunning?: boolean;
  isTaskDelisted?: boolean;
  myStakeInKoii?: number;
  minStake?: number;
  isPrivate?: boolean;
  isBountyEmpty?: boolean;
  hasAnUpdateAvailable?: boolean;
  hasAllVariablesPaired?: boolean;
  redirectToPairMissingExtensions?: () => void;
  isBonusTask?: boolean;
};

export function getTooltipContent({
  isRunning,
  isTaskDelisted,
  myStakeInKoii = 0,
  minStake = 0,
  isPrivate,
  isBountyEmpty,
  hasAnUpdateAvailable,
  hasAllVariablesPaired = true,
  redirectToPairMissingExtensions,
  isBonusTask,
}: GetTooltipContentParamsType) {
  if (isBonusTask && isBountyEmpty) {
    return 'Next season starts soon! Stay tuned to continue boosting your earnings.';
  }
  if (!isPrivate) {
    if (!isRunning && isTaskDelisted) {
      return "This task has been delisted, but don't worry! Your tokens are safe and will be ready to unstake after 3 rounds.";
    }
    if (isTaskDelisted) {
      return "This task has been delisted, but don't worry! Your tokens are safe. Pause the task and the tokens will be ready to unstake after 3 rounds.";
    }
  }
  if (isBonusTask && isBountyEmpty) {
    return 'Next season of boosting your tasks with bonus rewards will start soon, stay tuned!';
  }
  if (isBountyEmpty) {
    return 'This task is inactive because the bounty is empty. The creator needs to refill the bounty before you can run it again.';
  }
  if (hasAnUpdateAvailable) {
    return 'This task has been updated. Upgrade now to run it.';
  }
  if (!hasAllVariablesPaired) {
    return (
      <div>
        This task requires all its extensions to be paired.{' '}
        <button
          className="text-finnieTeal-100 hover:underline"
          onClick={redirectToPairMissingExtensions}
        >
          Pair the missing extension/s.
        </button>
      </div>
    );
  }
  if (myStakeInKoii > 0) {
    return isRunning ? 'Stop task' : 'Start task';
  }
  return `You need to stake at least ${minStake} KOII on this task to run it.`;
}

export function formatMilliseconds(milliseconds: number): string {
  // Create a duration object from the milliseconds
  const duration = intervalToDuration({ start: 0, end: milliseconds });

  // Build the formatted string manually to avoid showing seconds
  const hours = duration.hours || 0;
  const minutes = duration.minutes || 0;

  let formattedString = '';

  // Append hours to the string if there are any
  if (hours > 0) {
    formattedString += `${hours} h `;
  }

  // Always append minutes, even if it's 0 when hours are present
  formattedString += `${minutes} min`;

  return formattedString.trim();
}

export function joinPaginatedResponseContent(
  data: InfiniteData<PaginatedResponse<Task>>
) {
  return data.pages.map(({ content }) => content).flat();
}
