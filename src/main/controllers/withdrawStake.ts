import { Event } from 'electron';

import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@_koii/web3.js';
import {
  KPL_CONTRACT_ID,
  TASK_CONTRACT_ID,
  TASK_INSTRUCTION_LAYOUTS,
  TASK_INSTRUCTION_LAYOUTS_KPL,
  encodeData,
} from '@koii-network/task-node';
import koiiTasks from 'main/services/koiiTasks';
import sdk from 'main/services/sdk';
import {
  getTaskDataFromCache,
  savePendingRewardsRecordToCache,
  saveStakeRecordToCache,
} from 'main/services/tasks-cache-utils';
import { sendAndDoubleConfirmTransaction } from 'main/util';
import { ErrorType, RawTaskData } from 'models';
import { WithdrawStakeParam } from 'models/api';
import { throwDetailedError, throwTransactionError } from 'utils/error';

import {
  getKplStakingAccountKeypair,
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

const withdrawStake = async (
  _: Event,
  payload: WithdrawStakeParam
): Promise<string> => {
  const {
    taskAccountPubKey,
    shouldCheckCachedStake = true,
    taskType = 'KOII',
  } = payload;
  const isKPLTask = taskType === 'KPL';
  const mainSystemAccount = await getMainSystemAccountKeypair();
  const getCorrespondingStakingAccKeypair = isKPLTask
    ? getKplStakingAccountKeypair
    : getStakingAccountKeypair;
  const stakingAccKeypair = await getCorrespondingStakingAccKeypair();

  const instructionLayout = isKPLTask
    ? TASK_INSTRUCTION_LAYOUTS_KPL.Withdraw
    : TASK_INSTRUCTION_LAYOUTS.Withdraw;
  const data = encodeData(instructionLayout, {});

  const programId = isKPLTask ? KPL_CONTRACT_ID : TASK_CONTRACT_ID;

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(taskAccountPubKey),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: stakingAccKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId,
    data,
  });

  const cacheData = await getTaskDataFromCache(taskAccountPubKey, 'stakeList');

  const amountToUnstake =
    cacheData?.stake_list?.[stakingAccKeypair.publicKey.toBase58()];

  if (shouldCheckCachedStake && !amountToUnstake)
    throw new Error(
      `No stake found in cache for the task ${taskAccountPubKey} when attempting to unstake`
    );

  try {
    const res = await sendAndDoubleConfirmTransaction(
      sdk.k2Connection,
      new Transaction().add(instruction),
      [mainSystemAccount, stakingAccKeypair]
    );

    const getStartedTasksPubKeys =
      (await koiiTasks.getStartedTasksPubKeys()) || [];
    const taskIsStarted = getStartedTasksPubKeys.includes(taskAccountPubKey);

    if (taskIsStarted) {
      await saveStakeRecordToCache(
        taskAccountPubKey,
        stakingAccKeypair.publicKey.toBase58(),
        0
      );

      if (shouldCheckCachedStake && amountToUnstake) {
        await savePendingRewardsRecordToCache(
          taskAccountPubKey,
          stakingAccKeypair.publicKey.toBase58(),
          amountToUnstake,
          true
        );

        koiiTasks.updateStartedTasksData(taskAccountPubKey, (taskData) => {
          const currentBalance =
            taskData.available_balances[
              stakingAccKeypair.publicKey.toBase58()
            ] ?? 0;

          const newTaskData: Omit<RawTaskData, 'is_running'> = {
            ...taskData,
            available_balances: {
              ...taskData.available_balances,
              [stakingAccKeypair.publicKey.toBase58()]:
                currentBalance + amountToUnstake,
            },
          };
          return newTaskData;
        });
      }
    }
    return res.signature;
  } catch (e: any) {
    console.error('Unstake error', e);
    console.error('Unstake error message', e?.message);
    const unstakingIsNotAvailableYet =
      e?.message.toLowerCase().includes('submission cannot withdraw') ||
      (e?.logs &&
        e?.logs.some((log: any) =>
          log.toLowerCase().includes('submission cannot withdraw')
        ));
    if (unstakingIsNotAvailableYet) {
      return throwDetailedError({
        detailed: e,
        type: ErrorType.UNSTAKE_UNAVAILABLE,
      });
    } else {
      return throwTransactionError(e);
    }
  }
};

export default withdrawStake;
