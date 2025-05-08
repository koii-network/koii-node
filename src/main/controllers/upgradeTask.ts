import { Event } from 'electron';

import { sleep } from 'main/util';

import { archiveTask } from './archiveTask';
import claimReward from './claimReward';
import { claimRewardKPL } from './claimRewardKPL';
import delegateStake from './delegateStake';
import { getAllTimeRewardsByTask } from './getAllTimeRewardsByTask';
import { getIsTaskRunning } from './getIsTaskRunning';
import { getTaskInfo } from './getTaskInfo';
import { getRunnedPrivateTasks, setRunnedPrivateTask } from './privateTasks';
import startTask from './startTask';
import stopTask from './stopTask';
import { storeAllTimeRewards } from './storeAllTimeRewards';
import { getPairedTaskVariableData, pairTaskVariable } from './taskVariables';
import withdrawStake from './withdrawStake';

const K2_MAX_FINALITY_DELAY = 5000;

interface UpgradeTaskParams {
  oldPublicKey: string;
  newPublicKey: string;
  newStake: number;
  useStakingWalletForStake?: boolean;
  tokenType: string;
}

export const upgradeTask = async (
  _: Event,
  {
    oldPublicKey,
    newPublicKey,
    newStake,
    useStakingWalletForStake,
    tokenType,
  }: UpgradeTaskParams
) => {
  await stopOldTask(oldPublicKey);

  await unstakeFromOldTask(oldPublicKey, tokenType);

  await ensureTransactionFinality();

  await claimRewardsFromOldTask(oldPublicKey, tokenType);

  await ensureTransactionFinality();

  await addUpAllTimeRewards(oldPublicKey, newPublicKey);

  const newTaskIsAlreadyRunning = await getIsTaskRunning({} as Event, {
    taskPublicKey: newPublicKey,
  });

  if (!newTaskIsAlreadyRunning) {
    const newTaskState = await getTaskInfo({} as Event, {
      taskAccountPubKey: newPublicKey,
      forceTaskRefetch: true,
    });

    const taskType = tokenType ? 'KPL' : 'KOII';
    await delegateStake({} as Event, {
      taskAccountPubKey: newPublicKey,
      stakeAmount: newStake,
      useStakingWallet: useStakingWalletForStake,
      stakePotAccount: newTaskState.stakePotAccount,
      taskType,
      mintAddress: newTaskState.tokenType,
      skipIfItIsAlreadyStaked: true,
    });

    await sleep(5000);

    await migrateTaskVariables({
      oldPublicKey,
      newPublicKey,
    });

    await startNewTask({
      oldPublicKey,
      newPublicKey,
      newTaskIsWhitelisted: newTaskState.isWhitelisted,
    });
  }

  setTimeout(async () => {
    await archiveTask({} as Event, {
      taskPubKey: oldPublicKey,
      skipClaimRewards: true,
    });
    console.log('UPGRADE TASK: old task archived');
  }, 1000);

  console.log('UPGRADE TASK: task upgrade completed');
};

const addUpAllTimeRewards = async (
  oldPublicKey: string,
  newPublicKey: string
) => {
  const oldTaskAllTimeRewards = await getAllTimeRewardsByTask({} as Event, {
    taskId: oldPublicKey,
  });
  const newTaskAllTimeRewards = await getAllTimeRewardsByTask({} as Event, {
    taskId: newPublicKey,
  });

  const rewardsHaveAlreadyBeenMigratedInPreviousUpgradeAttempt =
    !!newTaskAllTimeRewards;
  if (!rewardsHaveAlreadyBeenMigratedInPreviousUpgradeAttempt) {
    await storeAllTimeRewards({} as Event, {
      taskId: newPublicKey,
      newReward: oldTaskAllTimeRewards,
    });
  }
};

const stopOldTask = async (taskPublicKey: string) => {
  const isTaskRunning = await getIsTaskRunning({} as Event, {
    taskPublicKey,
  });
  if (isTaskRunning) {
    console.log('UPGRADE TASK: stop old task');
    await stopTask({} as Event, { taskAccountPubKey: taskPublicKey });
    console.log('UPGRADE TASK: stopped old task');
  }
};

interface PublicKeys {
  oldPublicKey: string;
  newPublicKey: string;
}

const migrateTaskVariables = async ({
  oldPublicKey,
  newPublicKey,
}: PublicKeys) => {
  const oldTaskPairedTaskVariables = (
    await getPairedTaskVariableData({
      taskAccountPubKey: oldPublicKey,
    })
  )?.taskPairings;

  if (oldTaskPairedTaskVariables) {
    console.log(
      'UPGRADE TASK: migrating task variables from old task to new task'
    );

    const oldTaskPairedTaskVariablesEntries = Object.entries(
      oldTaskPairedTaskVariables
    );

    for (const [
      variableInTaskName,
      desktopVariableId,
    ] of oldTaskPairedTaskVariablesEntries) {
      await pairTaskVariable({} as Event, {
        taskAccountPubKey: newPublicKey,
        variableInTaskName,
        desktopVariableId,
      });
    }

    console.log(
      'UPGRADE TASK: migrated task variables from old task to new task'
    );
  }
};

const unstakeFromOldTask = async (oldPubKey: string, tokenType: string) => {
  console.log('UPGRADE TASK: unstaking from old task');

  const taskType = tokenType ? 'KPL' : 'KOII';
  try {
    await withdrawStake({} as Event, {
      taskAccountPubKey: oldPubKey,
      shouldCheckCachedStake: false,
      taskType,
    }); /* eslint-disable @cspell/spellchecker */
    console.log('UPGRADE TASK: unstaked from old task');
  } catch (error: any) {
    const allowedErrors = [
      'No stake found in cache for the task',
      'You must stake before withdraw',
    ];

    const errorCanBeSafelyIgnored = allowedErrors.some((allowedError) =>
      error?.message.includes(allowedError)
    );
    if (!errorCanBeSafelyIgnored) {
      throw error;
    }
  }
};

const claimRewardsFromOldTask = async (
  oldPublicKey: string,
  tokenType: string
) => {
  console.log('UPGRADE TASK: claiming rewards from old task (if any)');
  try {
    const functionToClaimRewards = tokenType ? claimRewardKPL : claimReward;

    await functionToClaimRewards({} as Event, {
      taskAccountPubKey: oldPublicKey,
      tokenType,
    });
    console.log('UPGRADE TASK: claimed rewards from old task');
  } catch (error: any) {
    const taskDidntHaveRewardsToClaim = error?.message?.includes(
      "The provided claimer account doesn't have any balance on task state"
    );
    if (!taskDidntHaveRewardsToClaim) {
      throw error;
    }
  }
};

const startNewTask = async ({
  oldPublicKey,
  newPublicKey,
  newTaskIsWhitelisted,
}: PublicKeys & { newTaskIsWhitelisted: boolean }) => {
  const privateTasks = await getRunnedPrivateTasks();
  const oldTaskIsPrivate = privateTasks?.includes(oldPublicKey);
  const newTaskIsPrivate = oldTaskIsPrivate && !newTaskIsWhitelisted;

  if (newTaskIsPrivate) {
    await setRunnedPrivateTask({} as Event, {
      runnedPrivateTask: newPublicKey,
    });
  }

  console.log('UPGRADE TASK: starting new task');
  await startTask({} as Event, {
    taskAccountPubKey: newPublicKey,
    isPrivate: newTaskIsPrivate,
    forceRefetch: true,
  });
  console.log('UPGRADE TASK: started new task');
};

const ensureTransactionFinality = async () =>
  new Promise((resolve) => {
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(resolve, K2_MAX_FINALITY_DELAY);
    } else {
      resolve('Skipping delay in test environment');
    }
  });
