import {
  Icon,
  CurrencyMoneyLine,
  WarningTriangleLine,
} from '@_koii/koii-styleguide';
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import config from 'config';
import { sum } from 'lodash';
import { ErrorMessage, Button } from 'renderer/components/ui';
import {
  useNotEnoughFunds,
  useRunMultipleTasks,
} from 'renderer/features/common';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import {
  useMainAccountBalance,
  useUserAppConfig,
} from 'renderer/features/settings';
import { TaskWithStake } from 'renderer/types';
import { AppRoute } from 'renderer/types/routes';
import { ErrorContext } from 'renderer/utils';
import { getKoiiFromRoe } from 'utils';

import { SelectedTasksSummary } from './SelectedTasksSummary';

const { TASK_FEE } = config.node;

function ConfirmYourStake() {
  const navigate = useNavigate();
  const { state: selectedTasks } = useLocation();

  const [tasksToRun, setTasksToRun] = useState<TaskWithStake[]>(
    selectedTasks as TaskWithStake[]
  );
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState<boolean>();
  const { addAppNotification: showFirstTaskRunningNotification } =
    useAppNotifications('FIRST_TASK_RUNNING');
  const { addAppNotification: showReferralProgramNotification } =
    useAppNotifications('REFERRAL_PROGRAM');

  const { accountBalance: mainAccountBalance = 0, loadingAccountBalance } =
    useMainAccountBalance();
  const handleRunTasksSuccess = () => {
    handleSaveUserAppConfig({ settings: { onboardingCompleted: true } });
    showReferralProgramNotification();
    showFirstTaskRunningNotification();
  };
  const balanceInKoii = getKoiiFromRoe(mainAccountBalance);

  const { runAllTasks, runTasksLoading, runTasksError } = useRunMultipleTasks({
    tasksToRun,
    onRunAllTasksSuccessCallback: handleRunTasksSuccess,
  });
  const { showNotEnoughFunds } = useNotEnoughFunds();
  const { handleSaveUserAppConfig } = useUserAppConfig({
    onConfigSaveSuccess: () =>
      navigate(AppRoute.MyNode, {
        state: { noBackButton: true },
      }),
  });

  const totalKoiiStaked = useMemo(
    () => getKoiiFromRoe(sum(tasksToRun.map((task) => task.stake))),
    [tasksToRun]
  );
  const tasksFee = TASK_FEE * tasksToRun.length;
  const tasksFeeInKoii = getKoiiFromRoe(tasksFee);
  const totalKoiiToUse = totalKoiiStaked + tasksFeeInKoii;

  const handleConfirm = () => {
    if (balanceInKoii < totalKoiiToUse) {
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

  return (
    <div className="relative h-full overflow-hidden bg-finnieBlue-dark-secondary">
      <div className="px-8">
        <div className="mt-[60px] mb-[50px] text-finnieEmerald-light text-2xl text-center">
          You&apos;re choosing to run:
        </div>

        <SelectedTasksSummary
          selectedTasks={tasksToRun}
          tasksFee={tasksFeeInKoii}
          updateStake={updateStake}
          setIsRunButtonDisabled={setIsRunButtonDisabled}
        />

        <div className="flex items-center justify-center gap-4 px-3 mt-2">
          <Icon source={WarningTriangleLine} size={32} color="#FFC78F" />
          <div className="text-xs leading-5 text-finnieOrange">
            After your node makes its first submission, stake cannot be
            withdrawn until three rounds after the task is paused.
          </div>
        </div>

        <div className="flex justify-center mt-[40px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-center gap-2 mb-2 text-sm text-finnieEmerald-light">
              <Icon source={CurrencyMoneyLine} className="w-6 h-6" />
              {`Total mainAccountBalance: ${
                loadingAccountBalance
                  ? 'Loading mainAccountBalance...'
                  : balanceInKoii
              } KOII`}
            </div>
            <Button
              className="font-semibold bg-finnieGray-light text-finnieBlue-light w-[220px] h-[38px]"
              label={runTasksLoading ? 'Running tasks...' : 'Confirm'}
              disabled={runTasksLoading || isRunButtonDisabled}
              onClick={handleConfirm}
            />
            {runTasksError?.map((error, index) => (
              <ErrorMessage
                key={index}
                error={error}
                context={ErrorContext.START_TASK}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmYourStake;
