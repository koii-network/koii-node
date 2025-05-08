import { trackEvent } from '@aptabase/electron/renderer';
import { create, useModal } from '@ebay/nice-modal-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { NetworkErrors } from 'models';
import { Button, ErrorMessage, LoadingSpinner } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import { useStakingAccount } from 'renderer/features/settings/hooks';
import { useForceArchive } from 'renderer/features/tasks/hooks/useForceArchive';
import { useMyTaskStake } from 'renderer/features/tasks/hooks/useMyTaskStake';
import { useKplToken } from 'renderer/features/tokens/hooks/useKplToken';
import {
  getKPLStakingAccountPubKey,
  QueryKeys,
  stopTask,
  withdrawStake,
} from 'renderer/services';
import { Task } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { ParsedRoundTime, parseRoundTime } from 'renderer/utils';
import { getKoiiFromRoe } from 'utils';

import { useAverageSlotTime } from '../../hooks/useAverageSlotTime';
import { useTaskStatus } from '../../hooks/useTaskStatus';
import { useUnstakingAvailability } from '../../hooks/useUnstakingAvailability';

type PropsType = {
  task: Task;
};

export const Unstake = create<PropsType>(function AddStake({ task }) {
  const { publicKey, isRunning } = task;

  const { data: taskStake } = useMyTaskStake(task.publicKey, task.taskType);
  const isKPlTask = task.taskType === 'KPL';
  const { kplToken } = useKplToken({ tokenType: task.tokenType || '' });
  const tokenTicker = kplToken?.symbol || 'KOII';
  const myStake =
    isKPlTask && kplToken?.decimals
      ? (taskStake || 0) / 10 ** kplToken.decimals
      : getKoiiFromRoe(taskStake || 0);
  const [totalRoundTime, setTotalRoundTime] = useState(task.roundTime);
  const [parsedRoundTime, setParsedRoundTime] = useState<ParsedRoundTime>({
    value: 0,
    unit: 's',
  });

  const modal = useModal();

  const handleClose = () => {
    if (!isUnstaking) {
      modal.resolve(true);
      modal.remove();
    }
  };

  useCloseWithEsc({ closeModal: handleClose });

  const stopTaskAndUnstake = async () => {
    if (isRunning) {
      await stopTask(publicKey);
    }
    await withdrawStake(publicKey, task.taskType || 'KOII');
  };

  const queryClient = useQueryClient();

  const { handleForceArchiveError } = useForceArchive({
    taskPublicKey: publicKey,
  });

  const {
    mutate: unstake,
    isLoading: isUnstaking,
    error: errorUnstaking,
  } = useMutation<any, Error>(stopTaskAndUnstake, {
    onSuccess: () => {
      trackEvent('task_unstake', { taskPublicKey: publicKey });
      queryClient.invalidateQueries([
        QueryKeys.TaskStake,
        task.publicKey,
        task.taskType,
      ]);
      queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
      handleClose();
    },
    onError: async (error) => {
      const couldNotConfirmTransaction = error.message
        .toLowerCase()
        .includes(NetworkErrors.TRANSACTION_TIMEOUT);
      const thereIsNothingToUnstake = error.message
        .toLowerCase()
        .includes('You must stake before withdraw'.toLowerCase());

      if (couldNotConfirmTransaction || thereIsNothingToUnstake) {
        await window.main.getMyTaskStake({
          taskAccountPubKey: task.publicKey,
          shouldCache: true,
          revalidate: true,
          taskType: task.taskType || 'KOII',
        });

        queryClient.invalidateQueries([
          QueryKeys.TaskStake,
          task.publicKey,
          task.taskType,
        ]);
        queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
      }

      handleForceArchiveError(error);
    },
  });

  const { data: averageSlotTime } = useAverageSlotTime();

  const { data: stakingAccountPublicKey = '' } = useStakingAccount();
  const { data: kplStakingAccountPublicKey = '' } = useQuery(
    QueryKeys.KPLStakingAccount,
    getKPLStakingAccountPubKey
  );
  const correspondingStakingKey = useMemo(
    () =>
      task.taskType === 'KPL'
        ? kplStakingAccountPublicKey
        : stakingAccountPublicKey,
    [task.taskType, kplStakingAccountPublicKey, stakingAccountPublicKey]
  );

  const { taskStatus } = useTaskStatus({
    task,
    stakingAccountPublicKey: correspondingStakingKey,
  });

  const { canUnstake, isLoadingUnstakingAvailability } =
    useUnstakingAvailability({
      task,
      stakingAccountPublicKey: correspondingStakingKey,
    });

  useEffect(() => {
    if (!averageSlotTime) {
      return;
    }

    const getParsedRoundTime = async () => {
      try {
        const parsedRoundTime = parseRoundTime(
          task.roundTime * averageSlotTime * 3
        );
        setTotalRoundTime(task.roundTime * averageSlotTime);
        setParsedRoundTime(parsedRoundTime);
      } catch (error) {
        console.log(error);
      }
    };

    getParsedRoundTime();
  }, [task, totalRoundTime, taskStatus, isRunning, averageSlotTime]);

  const title = canUnstake ? 'Unstake' : 'Finish the Round';
  const buttonAction = canUnstake ? () => unstake() : handleClose;
  const buttonLabel = canUnstake ? 'Unstake' : 'Okay';
  const buttonClasses = canUnstake
    ? 'text-purple-3 bg-white py-4 border-2 border-purple-3'
    : 'text-purple-3 bg-white py-4';
  const waitingTime = `${Math.ceil(parsedRoundTime.value)} ${
    parsedRoundTime.unit
  }`;
  const unavailableText = (
    <div className="text-lg px-28">
      <p className="mb-3">
        In order to make sure everyone plays fairly, each node must wait 3
        rounds after the last submission to unstake.
      </p>
      <p className="mb-3 font-bold">Check back in about {waitingTime}.</p>
    </div>
  );

  return (
    <Modal>
      <ModalContent className="w-[600px]" theme={Theme.Dark}>
        <ModalTopBar
          title={title}
          onClose={handleClose}
          theme="dark"
          closeButtonClasses={
            isUnstaking ? '!text-gray-500 cursor-not-allowed' : ''
          }
          closeButtonTooltipContent={
            isUnstaking
              ? 'The window will close automatically once the operation is complete.'
              : undefined
          }
        />

        <div className="flex flex-col items-center justify-center h-64 gap-5 py-8 text-white">
          {isLoadingUnstakingAvailability ? (
            <div className="flex items-center h-full">
              <LoadingSpinner className="w-24 h-24" />
            </div>
          ) : (
            <>
              {canUnstake ? (
                <>
                  <div>
                    Do you want to unstake your tokens? <br /> They will be
                    available to claim shortly.
                  </div>
                  <div>
                    <div>
                      <p className="text-4xl mt-1.5 text-center">
                        {myStake} {tokenTicker}
                      </p>
                    </div>
                    <div className="pb-2 text-xs text-finnieTeal-100">
                      Current {tokenTicker} staked.
                    </div>
                    <div className="h-12 -mt-4 -mb-8">
                      {errorUnstaking && (
                        <ErrorMessage error={errorUnstaking as Error} />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                unavailableText
              )}
              {isUnstaking ? (
                <LoadingSpinner className="w-10 h-10 mx-auto" />
              ) : (
                <Button
                  label={buttonLabel}
                  onClick={buttonAction}
                  className={buttonClasses}
                  loading={isUnstaking}
                  disabled={canUnstake && !myStake}
                />
              )}
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
});
