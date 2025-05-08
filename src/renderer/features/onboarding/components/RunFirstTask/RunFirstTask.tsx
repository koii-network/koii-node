import { Icon } from '@_koii/koii-styleguide';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ReloadSvg from 'assets/svgs/reload-icon-big.svg';
import config from 'config';
import { FundButton } from 'renderer/components/FundButton';
import { Button, ErrorMessage, LoadingSpinner } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import {
  useNotEnoughFunds,
  useRunMultipleTasks,
} from 'renderer/features/common';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import {
  useMainAccount,
  useMainAccountBalance,
  useUserAppConfig,
} from 'renderer/features/settings';
import { useMyTaskStake } from 'renderer/features/tasks/hooks/useMyTaskStake';
import { useKplToken } from 'renderer/features/tokens/hooks/useKplToken';
import { getKPLBalance, QueryKeys } from 'renderer/services';
import { TaskWithStake } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { AppRoute } from 'renderer/types/routes';
import { ErrorContext } from 'renderer/utils';
import { getKoiiFromRoe } from 'utils';

import { BalanceHelp } from './BalanceHelp';
import { useRunFirstTasksLogic } from './hooks';
import TaskItem from './TaskItem';

function RunFirstTask() {
  const [isRunButtonDisabled, setIsRunButtonDisabled] =
    useState<boolean>(false);
  const {
    selectedTasks,
    loadingVerifiedTasks,
    stakePerTask,
    totalStaked: totalToStake,
    handleStakeInputChange,
    handleTaskRemove,
  } = useRunFirstTasksLogic();

  const [tasksToRun, setTasksToRun] = useState(
    selectedTasks as TaskWithStake[]
  );
  const [showMinimumStakeError, setShowMinimumStakeError] =
    useState<boolean>(false);

  const { TASK_FEE } = config.node;

  const navigate = useNavigate();

  useEffect(() => {
    setTasksToRun(selectedTasks);
  }, [selectedTasks]);

  const {
    accountBalance: mainAccountBalance = 0,
    loadingAccountBalance,
    refetchAccountBalance: refreshMainAccountBalance,
  } = useMainAccountBalance();
  const totalToStakeInKoii = useMemo(
    () => getKoiiFromRoe(totalToStake),
    [totalToStake]
  );

  const queryCache = useQueryClient();

  const { data: mainAccountPubKey = '' } = useMainAccount();

  const { kplToken } = useKplToken({
    tokenType: selectedTasks?.[0]?.tokenType || '',
  });

  const { handleSaveUserAppConfig } = useUserAppConfig({
    onConfigSaveSuccess: () =>
      navigate(AppRoute.MyNode, {
        state: { noBackButton: true },
      }),
  });
  const { addAppNotification: showFirstTaskRunningNotification } =
    useAppNotifications('FIRST_TASK_RUNNING');
  const { addAppNotification: showReferralProgramNotification } =
    useAppNotifications('REFERRAL_PROGRAM');
  const handleRunTasksSuccess = () => {
    handleSaveUserAppConfig({ settings: { onboardingCompleted: true } });
    showReferralProgramNotification();
    showFirstTaskRunningNotification();
  };

  const { data: alreadyStakedTokensAmount = 0 } = useMyTaskStake(
    selectedTasks?.[0]?.publicKey,
    selectedTasks?.[0]?.taskType,
    false,
    true
  );

  const { runAllTasks, runTasksLoading, runTasksError } = useRunMultipleTasks({
    tasksToRun,
    onRunAllTasksSuccessCallback: handleRunTasksSuccess,
  });
  const tasksFee = TASK_FEE * tasksToRun.length;
  const tasksFeeInKoii = getKoiiFromRoe(tasksFee);

  const stakeAmount =
    alreadyStakedTokensAmount >= selectedTasks?.[0]?.minStake
      ? 0
      : totalToStakeInKoii;
  const totalKoiiToUse = stakeAmount + tasksFeeInKoii;
  const { showNotEnoughFunds } = useNotEnoughFunds();

  const totalStakeInKoii = useMemo(
    () =>
      tasksToRun.reduce(
        (acc, task) =>
          task.taskType === 'KOII' ? acc + getKoiiFromRoe(task.stake) : acc,
        0
      ),
    [tasksToRun]
  );

  const totalStakeInKpl = useMemo(
    () =>
      tasksToRun.reduce(
        (acc, task) =>
          task.taskType === 'KPL' ? acc + getKoiiFromRoe(task.stake) : acc,
        0
      ),
    [tasksToRun]
  );

  const totalFeesInKoii = useMemo(
    () =>
      tasksToRun.reduce(
        (acc, task) => acc + getKoiiFromRoe(config.node.TASK_FEE),
        0
      ),
    [tasksToRun]
  );

  const isKPlTask = useMemo(
    () => selectedTasks?.[0]?.taskType === 'KPL',
    [selectedTasks]
  );

  const {
    data: kpLBalanceList,
    isLoading: isKpLBalanceLoading,
    refetch: refreshKpLBalance,
  } = useQuery(
    [QueryKeys.KplBalanceList, mainAccountPubKey],
    () => getKPLBalance(mainAccountPubKey),
    { enabled: isKPlTask }
  );

  const kplBalance =
    kpLBalanceList?.find(
      (balance) => balance.mint === selectedTasks?.[0]?.tokenType
    )?.balance || 0;

  const kplBalanceToDisplay = getKoiiFromRoe(kplBalance);
  const balanceInKoii = getKoiiFromRoe(mainAccountBalance);

  const balanceToDisplay =
    selectedTasks?.[0]?.taskType === 'KOII'
      ? balanceInKoii
      : kplBalanceToDisplay;

  const hasEnoughForStake = useMemo(() => {
    const hasEnoughKoii = balanceInKoii >= totalStakeInKoii + totalFeesInKoii;
    const hasEnoughKpl = kplBalance >= totalStakeInKpl;
    return isKPlTask ? hasEnoughKpl : hasEnoughKoii;
  }, [
    balanceInKoii,
    kplBalance,
    totalStakeInKoii,
    totalStakeInKpl,
    isKPlTask,
    totalFeesInKoii,
  ]);

  const hasEnoughForFees = useMemo(
    () => balanceInKoii >= totalFeesInKoii,
    [balanceInKoii, totalFeesInKoii]
  );

  const handleConfirm = () => {
    if (!hasEnoughForStake) {
      showNotEnoughFunds();
    } else if (!hasEnoughForFees) {
      showNotEnoughFunds();
    } else {
      runAllTasks();
    }
  };

  const updateStake = (publicKey: string, newStake: number) => {
    const updatedTasks = tasksToRun.map((task) => {
      const updatedTask = {
        ...task,
        ...(task.publicKey === publicKey && { stake: newStake }),
      };

      return updatedTask;
    });

    setTasksToRun(updatedTasks);
  };

  const minimumStake = useMemo(
    () =>
      getKoiiFromRoe(
        selectedTasks.reduce((acc, task) => acc + (task.minStake || 0), 0)
      ),
    [selectedTasks]
  );

  const tokenTicker = kplToken?.symbol || 'KOII';

  const isLoadingBalance = isKPlTask
    ? isKpLBalanceLoading
    : loadingAccountBalance;

  const [isAnimatingBalanceRefetch, setIsAnimatingBalanceRefetch] =
    useState(false);

  const refreshBalance = isKPlTask
    ? refreshKpLBalance
    : refreshMainAccountBalance;

  const handleRefetch = useCallback(() => {
    setIsAnimatingBalanceRefetch(true);
    setTimeout(() => {
      setIsAnimatingBalanceRefetch(false);
    }, 800);
    refreshBalance();
  }, [refreshBalance]);

  return (
    <div className="relative w-full h-full">
      <div className="flex flex-col items-center justify-evenly w-full h-full text-center">
        <div>
          <p className="mb-2 text-2xl leading-8 text-finnieEmerald-light">
            Get Started
          </p>
          <div className="text-sm mb-5 text-center">
            You&apos;ll need some KOII to run your first task, to pay for gas
            fees. Just press <span className="font-semibold">Confirm</span> to
            start running. <br /> The more tasks you complete, the more you
            earn.
          </div>
        </div>
        <div className="w-full">
          <div className="grid w-full mt-2 mb-1 md2h:my-4 text-sm text-left grid-cols-first-task text-finnieEmerald-light">
            <div className="col-span-2 mx-auto">Info</div>
            <div className="col-span-6 -ml-[2px]">Task</div>
            <div className="col-span-6 -ml-[2px]">Creator</div>
            <div className="col-span-4 2xl:col-start-15 2xl:col-span-4 -ml-[2px]">
              Stake
            </div>
          </div>
          <div className="w-full h-full overflow-x-hidden overflow-hidden z-0">
            {loadingVerifiedTasks ? (
              <LoadingSpinner className="m-auto mt-12 w-10 h-10" />
            ) : (
              selectedTasks.map((task, index) => (
                <div className="w-full h-auto pb-2 text-sm" key={index}>
                  <TaskItem
                    stakeValue={stakePerTask[task?.publicKey] ?? 0}
                    onStakeInputChange={(newStake) => {
                      handleStakeInputChange(newStake, task.publicKey);
                      updateStake(task.publicKey, newStake);
                      setIsRunButtonDisabled(newStake < task.minStake);
                    }}
                    onRemove={() => handleTaskRemove(task.publicKey)}
                    index={index}
                    task={task}
                    setShowMinimumStakeError={setShowMinimumStakeError}
                  />
                  <div className="flex items-center justify-between w-full px-4 mt-1 md2h:mt-3 text-sm font-semibold leading-5">
                    <div className="flex gap-2">
                      <p className="text-orange-2">Task Fees</p>
                      <p>~0.01 KOII</p>
                    </div>

                    {!!alreadyStakedTokensAmount && (
                      <div className="flex gap-2">
                        <p className="text-finnieEmerald-light">
                          Total {tokenTicker} already staked
                        </p>
                        <p>{getKoiiFromRoe(alreadyStakedTokensAmount)} KOII</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <p className="text-finnieEmerald-light">
                        Total {tokenTicker} to stake
                      </p>
                      <p>
                        {stakeAmount} {tokenTicker}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center gap-2 mb-1.5 text-sm text-finnieEmerald-light">
            {`Total balance: ${
              isLoadingBalance ? 'Loading balance...' : balanceToDisplay
            } ${tokenTicker}`}
            <FundButton />
            <Popover tooltipContent="Refresh your balance" theme={Theme.Dark}>
              <button onClick={() => handleRefetch()}>
                <Icon
                  source={ReloadSvg}
                  className={`w-6 h-6 text-white ${
                    isAnimatingBalanceRefetch ? 'animate-rotate-once' : ''
                  }`}
                />
              </button>
            </Popover>
          </div>

          {runTasksLoading ? (
            <div className="h-[38px]">
              <LoadingSpinner className="m-auto w-10 h-10" />
            </div>
          ) : (
            <Button
              className="font-semibold bg-finnieGray-light text-finnieBlue-light w-56 h-[38px]"
              label="Confirm"
              disabled={runTasksLoading || isRunButtonDisabled}
              onClick={handleConfirm}
            />
          )}

          {showMinimumStakeError ? (
            <p className="pt-3.5 text-xs text-finnieRed">
              Whoops! Make sure you stake at least {minimumStake} KOII on this
              task.
            </p>
          ) : runTasksError?.length ? (
            runTasksError?.map((error, index) => (
              <ErrorMessage
                key={index}
                error={error}
                context={ErrorContext.START_TASK}
              />
            ))
          ) : (
            <BalanceHelp />
          )}
        </div>
      </div>
    </div>
  );
}

export default RunFirstTask;
