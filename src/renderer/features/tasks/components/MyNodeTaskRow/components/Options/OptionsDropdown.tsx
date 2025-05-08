import {
  Icon,
  RemoveLine,
  TooltipChatQuestionLeftLine,
} from '@_koii/koii-styleguide';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { twMerge } from 'tailwind-merge';

import Archive from 'assets/svgs/archive.svg';
import CurrencyIcon from 'assets/svgs/currency.svg';
import Output from 'assets/svgs/output.svg';
import PauseCircle from 'assets/svgs/pause-circle.svg';
import PlayCircle from 'assets/svgs/play-circle.svg';
import RefreshIcon from 'assets/svgs/Reload.svg';
import { LoadingSpinner } from 'renderer/components';
import { useMainAccount, useStakingAccount } from 'renderer/features';
import { useForceArchive } from 'renderer/features/tasks/hooks/useForceArchive';
import { useMyTaskStake } from 'renderer/features/tasks/hooks/useMyTaskStake';
import {
  QueryKeys,
  TaskService,
  archiveTask as archiveTaskService,
} from 'renderer/services';
import { Task } from 'renderer/types';

type PropsType = {
  task: Task;
  isInverted: boolean;
  canUnstake?: boolean;
  isOpen: boolean;
  addStake: () => void;
  unstake: () => void;
  runOrStopTask: () => void;
  openLogs: () => void;
  onTaskArchive: (isArchiving: boolean) => void;
  handleRestartTask: () => void;
  isRestartingTask: boolean;
};

export function OptionsDropdown({
  task,
  isInverted,
  canUnstake,
  addStake,
  unstake,
  runOrStopTask,
  openLogs,
  onTaskArchive,
  isOpen,
  handleRestartTask,
  isRestartingTask,
}: PropsType) {
  const queryCache = useQueryClient();

  const { data: stakingAccountPublicKey = '' } = useStakingAccount();

  const pendingRewards = TaskService.getPendingRewardsByTask(
    task,
    stakingAccountPublicKey
  );

  const { data: mainAccountPublicKey } = useMainAccount();

  const { handleForceArchiveError } = useForceArchive({
    taskPublicKey: task.publicKey,
  });

  const { mutate: archiveTask, isLoading: isArchivingTask } = useMutation(
    () => archiveTaskService(task.publicKey),
    {
      onMutate: () => {
        onTaskArchive(true);
      },
      onSettled: () => {
        onTaskArchive(false);
      },
      onSuccess: async () => {
        if (pendingRewards) {
          toast.success(
            'We sent the pending rewards from this task to your account.'
          );
        }
        await queryCache.invalidateQueries([QueryKeys.taskNodeInfo]);
        await queryCache.invalidateQueries([
          QueryKeys.MainAccountBalance,
          mainAccountPublicKey,
        ]);
        queryCache.invalidateQueries([
          QueryKeys.KplBalanceList,
          mainAccountPublicKey,
        ]);
        queryCache.invalidateQueries([QueryKeys.TaskList]);
        queryCache.invalidateQueries(QueryKeys.availableTaskList);
      },
      onError: handleForceArchiveError,
      retry: 4,
    }
  );
  const { data: taskStake } = useMyTaskStake(task.publicKey, task.taskType);

  const isTaskDelisted = !task.isActive;
  const isRunPauseButtonDisabled =
    !task.isRunning && (!taskStake || isTaskDelisted);
  const isArchiveDisabled = task.isRunning || !!taskStake || isArchivingTask;
  const baseItemClasses = 'flex gap-2 text-white cursor-pointer group';
  const containerClasses = twMerge(
    'z-10 bg-purple-5 overflow-hidden text-base absolute -right-[21px] pl-4 rounded-xl flex flex-col justify-evenly',
    isInverted ? 'bottom-[49px]' : 'top-[49px]',
    isOpen
      ? 'w-[290px] h-[216px] opacity-100 transition-open'
      : 'h-0 w-0 opacity-0 transition-close'
  );
  const disabledItemClasses = '!text-[#949494] !cursor-not-allowed';
  const baseHintClasses =
    'bg-gray-light/20 text-gray-light text-xs rounded p-1 ml-auto mr-2';
  const unstakeWhenRunningMessage = (
    <span className={baseHintClasses}>Stop Task to Unstake</span>
  );
  const nothingToUnstake = (
    <span className={baseHintClasses}>No tokens to unstake</span>
  );
  const unstakeWhenCoolingDownMessage = (
    <button onClick={unstake} className={baseHintClasses}>
      Wait 3 rounds
      <Icon
        source={TooltipChatQuestionLeftLine}
        className="text-white w-4 h-3.5 ml-2"
      />
    </button>
  );
  const archiveWhenRunningMessage = (
    <span className={baseHintClasses}>Stop Task to Archive</span>
  );
  const archiveWithStakeMessage = (
    <button onClick={unstake} className={baseHintClasses}>
      Unstake to Archive
    </button>
  );
  const unstakingSideMessage = task.isRunning ? (
    unstakeWhenRunningMessage
  ) : canUnstake === undefined ? (
    <div className="w-full">
      <LoadingSpinner className="ml-auto mr-12" />
    </div>
  ) : canUnstake === false && !!taskStake ? (
    unstakeWhenCoolingDownMessage
  ) : !taskStake ? (
    nothingToUnstake
  ) : null;

  return (
    <div className={containerClasses}>
      <button
        onClick={runOrStopTask}
        className={`${baseItemClasses} ${
          isRunPauseButtonDisabled ? disabledItemClasses : ''
        }`}
        disabled={isRunPauseButtonDisabled}
      >
        <Icon
          source={task.isRunning ? PauseCircle : PlayCircle}
          className={
            isRunPauseButtonDisabled
              ? ''
              : 'transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110'
          }
        />
        {task.isRunning ? 'Stop Task' : 'Start Task'}
      </button>
      {isRestartingTask ? (
        <LoadingSpinner className="ml-10 cursor-auto" />
      ) : (
        <button
          className={`${baseItemClasses} ${
            !task.isRunning || isRestartingTask ? disabledItemClasses : ''
          }`}
          onClick={handleRestartTask}
          disabled={!task.isRunning || isRestartingTask}
        >
          <Icon
            source={RefreshIcon}
            className={
              !task.isRunning || isRestartingTask
                ? ''
                : 'transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110'
            }
          />
          Restart Task
        </button>
      )}
      <button
        onClick={addStake}
        className={`${baseItemClasses} ${
          isTaskDelisted ? disabledItemClasses : ''
        }`}
        disabled={isTaskDelisted}
      >
        <Icon
          source={CurrencyIcon}
          className={
            isTaskDelisted
              ? ''
              : 'transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110'
          }
        />
        Add Stake
      </button>
      <button
        onClick={unstake}
        disabled={!canUnstake || !taskStake}
        className={`${baseItemClasses} ${
          !canUnstake || !taskStake ? disabledItemClasses : ''
        }`}
      >
        <Icon
          source={RemoveLine}
          className={
            !canUnstake || !taskStake
              ? ''
              : 'transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110'
          }
        />
        Unstake
        {unstakingSideMessage}
      </button>
      {isArchivingTask ? (
        <LoadingSpinner className="ml-10 cursor-auto" />
      ) : (
        <button
          className={`${baseItemClasses} ${
            isArchiveDisabled ? disabledItemClasses : ''
          }`}
          disabled={isArchiveDisabled}
          onClick={() => archiveTask()}
        >
          <Icon
            source={Archive}
            className={
              isArchiveDisabled
                ? ''
                : 'transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110'
            }
          />
          Archive
          {task.isRunning
            ? archiveWhenRunningMessage
            : taskStake
            ? archiveWithStakeMessage
            : null}
        </button>
      )}
      <button className={baseItemClasses} onClick={openLogs}>
        <Icon
          source={Output}
          className="transition-all duration-300 group-hover:rotate-[361deg] group-hover:scale-110"
        />
        Output Logs
      </button>
    </div>
  );
}
