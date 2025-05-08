/* eslint-disable @cspell/spellchecker */
import { trackEvent } from '@aptabase/electron/renderer';

import { StartStopAllTasksParams } from 'main/controllers/types';
import { DelegateStakeParam, TaskType } from 'models';
import { Task } from 'renderer/types';
import { ErrorContext, getErrorToDisplay } from 'renderer/utils/error';
import { getKoiiFromRoe } from 'utils';

import { fetchMyTasks } from './k2';

export const stopAllTasks = async (payload?: StartStopAllTasksParams) => {
  trackEvent('task_stop_all');
  return window.main.stopAllTasks(payload);
};

export const startAllTasks = async (payload?: StartStopAllTasksParams) => {
  trackEvent('task_start_all');
  return window.main.startAllTasks(payload);
};

export const getStakingAccountPublicKey = async (): Promise<string> => {
  const pubkey = await window.main.getStakingAccountPubKey();
  return pubkey;
};

export const getKPLStakingAccountPubKey = async (): Promise<string> => {
  const pubkey = await window.main.getKPLStakingAccountPubKey();
  return pubkey;
};

export const withdrawStake = (
  taskAccountPubKey: string,
  taskType: 'KPL' | 'KOII'
) => {
  return window.main.withdrawStake({ taskAccountPubKey, taskType });
};

export const stakeOnTask = (params: DelegateStakeParam) => {
  // TO DO KPL: divide by number of decimals for individual tokens
  const stakeAmountInKoii = getKoiiFromRoe(params.stakeAmount);
  const paramsWithStakeInKoii = {
    ...params,
    stakeAmount: stakeAmountInKoii,
  };
  return window.main.delegateStake(paramsWithStakeInKoii);
};
export const transferKoiiFromMainWallet = (
  accountName: string,
  amount: number,
  toWalletAddress: string
) => {
  return window.main.transferKoiiFromMainWallet({
    accountName,
    amount,
    toWalletAddress,
  });
};
export const transferKoiiFromStakingWallet = (
  accountName: string,
  amount: number,
  toWalletAddress: string
) => {
  return window.main.transferKoiiFromStakingWallet({
    accountName,
    amount,
    toWalletAddress,
  });
};

export const getRentAmount = () => {
  return window.main.getRentAmount();
};

export const startTask = (
  taskAccountPubKey: string,
  isPrivate?: boolean,
  forceRefetch?: boolean
) => {
  console.log(`${isPrivate ? 'FORCE' : ''} STARTING TASK`, taskAccountPubKey);
  return window.main.startTask({ taskAccountPubKey, isPrivate, forceRefetch });
};

export const stopTask = (taskAccountPubKey: string) => {
  trackEvent('task_stop', { taskPublicKey: taskAccountPubKey });
  return window.main.stopTask({ taskAccountPubKey });
};

export const claimTaskReward = async (taskAccountPubKey: string) => {
  trackEvent('task_claim_reward', { taskPublicKey: taskAccountPubKey });
  return window.main.claimReward({ taskAccountPubKey });
};

export const claimRewards = async (): Promise<void> => {
  const getCorrespondingStakingKeyGetter = (taskType: TaskType) =>
    taskType === 'KPL'
      ? getKPLStakingAccountPubKey
      : getStakingAccountPublicKey;
  const tasks = (await fetchMyTasks({ limit: Infinity, offset: 0 })).content;
  const getPendingRewardsByTask = async (task?: Task) => {
    const getCorrespondingStakingKey = getCorrespondingStakingKeyGetter(
      task?.taskType || 'KOII'
    );
    const correspondingStakingKey = await getCorrespondingStakingKey();

    return task?.availableBalances[correspondingStakingKey] || 0;
  };
  const tasksWithTheirRewards = await Promise.all(
    tasks.map(async (task) => {
      const pendingRewards = await getPendingRewardsByTask(task);
      return pendingRewards > 0 ? task : null;
    })
  );

  const tasksWithClaimableRewards = tasksWithTheirRewards.filter(
    (task) => task !== null
  ) as Task[];

  let numberOfFailedClaims = 0;
  let errorMessage = '';

  const promisesToClaimRewards = tasksWithClaimableRewards.map(async (task) => {
    const pendingReward = await getPendingRewardsByTask(task);
    const isKPlTask = task.taskType === 'KPL';
    const handlerToClaimReward = isKPlTask
      ? window.main.claimRewardKPL
      : window.main.claimReward;
    try {
      await handlerToClaimReward({
        taskAccountPubKey: task.publicKey,
        tokenType: task.tokenType || '',
      });
      await window.main.storeAllTimeRewards({
        taskId: task.publicKey,
        newReward: pendingReward,
      });
    } catch (error: any) {
      console.error(`Error while claiming reward for Task: ${task.publicKey}`);
      console.error(error);
      errorMessage = getErrorToDisplay(error, ErrorContext.CLAIM_REWARD) || '';
      numberOfFailedClaims += 1;
    }
  });

  await Promise.all(promisesToClaimRewards);

  if (numberOfFailedClaims) {
    const customError = new Error(
      `Failed claims: ${numberOfFailedClaims}, Error: ${errorMessage}`
    );

    (customError as any).numberOfFailedClaims = numberOfFailedClaims;
    (customError as any).errorMessage = errorMessage;

    throw customError;
  }
};

export const redeemTokensInNewNetwork = (): Promise<number> => {
  return window.main.redeemTokensInNewNetwork();
};

export const fundStakingWalletFromMainWallet = async (amountInRoe: number) => {
  return window.main.creditStakingWalletFromMainWallet({ amountInRoe });
};
