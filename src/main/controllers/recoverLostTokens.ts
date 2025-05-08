import { Keypair, PublicKey } from '@_koii/web3.js';
import { TASK_CONTRACT_ID } from 'config/node';
import { getStakingAccountKeypair } from 'main/node/helpers/wallets';
import koiiTasks from 'main/services/koiiTasks';
import sdk from 'main/services/sdk';
import { sleep } from 'main/util';

import claimReward from './claimReward';
import getUserConfig from './getUserConfig';
import storeUserConfig from './storeUserConfig';
import withdrawStake from './withdrawStake';

export const recoverLostTokens = async () => {
  const taskIds = await getNonStartedTaskIds();
  const stakingAccKeypair = await getStakingAccountKeypair();

  const { tasksHavingPendingRewards, tasksHavingPendingStake } =
    await getPendingRewardsAndStakes(taskIds, stakingAccKeypair);

  console.log({ tasksHavingPendingRewards, tasksHavingPendingStake });

  await recoverPendingRewards(tasksHavingPendingRewards);
  await recoverPendingStakes(tasksHavingPendingStake);
  await updateLastLostTokensClaimDate();

  console.log('Recovery flow completed.');
};

// Helper functions:

const updateLastLostTokensClaimDate = async () => {
  const userConfig = await getUserConfig();
  const lastLostTokensClaimDate = new Date().toISOString();
  await storeUserConfig({} as Event, {
    settings: { ...userConfig, lastLostTokensClaimDate },
  });
};

const getNonStartedTaskIds = async (): Promise<string[]> => {
  // eslint-disable-next-line @cspell/spellchecker
  const BASE_58_ENCODED_INIT_STRING = '2A7XGNY2nv87Z6mpUWwBSnfj';
  const taskIds = await sdk.k2Connection.getProgramAccounts(
    new PublicKey(TASK_CONTRACT_ID),
    {
      filters: [
        {
          memcmp: {
            offset: 0 /* offset where the whitelisted bytes start */,
            bytes: BASE_58_ENCODED_INIT_STRING,
          },
        },
      ],
      dataSlice: {
        offset: 0,
        length: 0,
      },
    }
  );
  console.log('Total tasks', taskIds.length);

  const startedTasks = await koiiTasks.getStartedTasksPubKeys();
  const startedTaskSet = new Set(startedTasks);
  const filteredIds = taskIds.reduce((acc, { pubkey }) => {
    const taskId = pubkey.toBase58();
    if (!startedTaskSet.has(taskId)) {
      acc.push(taskId);
    }
    return acc;
  }, [] as string[]);

  return filteredIds;
};

interface TaskWithPendingRewards {
  pendingReward: number;
  taskAccountPubKey: string;
}

interface TaskWithPendingStake {
  stake: number;
  taskAccountPubKey: string;
}

const getPendingRewardsAndStakes = async (
  taskIds: string[],
  stakingAccKeypair: Keypair
) => {
  const tasksHavingPendingRewards: TaskWithPendingRewards[] = [];
  const tasksHavingPendingStake: TaskWithPendingStake[] = [];

  for (const taskId of taskIds) {
    try {
      const taskState = await koiiTasks.getTaskState(taskId, {
        withAvailableBalances: true,
      });

      const taskHasPendingRewards =
        !!taskState?.available_balances?.[
          stakingAccKeypair.publicKey.toBase58()
        ];
      if (taskHasPendingRewards) {
        tasksHavingPendingRewards.push({
          pendingReward:
            taskState?.available_balances?.[
              stakingAccKeypair.publicKey.toBase58()
            ],
          taskAccountPubKey: taskId,
        });
      }

      const taskStakeInfo = await sdk.k2Connection.getMyTaskStakeInfo(
        new PublicKey(taskId),
        stakingAccKeypair.publicKey
      );

      if (taskStakeInfo?.data) {
        tasksHavingPendingStake.push({
          stake: taskStakeInfo.data,
          taskAccountPubKey: taskId,
        });
      }
    } catch (error: any) {
      if (!error.message.includes('No stake available on this task')) {
        console.error(error);
      }
    }
  }

  return { tasksHavingPendingRewards, tasksHavingPendingStake };
};

const recoverPendingRewards = async (
  tasksHavingPendingRewards: TaskWithPendingRewards[]
) => {
  for (const { taskAccountPubKey } of tasksHavingPendingRewards) {
    try {
      await claimReward({} as Event, { taskAccountPubKey });
      await sleep(1000);
    } catch (error) {
      console.log(
        `Error recovering pending rewards for task ${taskAccountPubKey}:`,
        error
      );
    }

    await sleep(1000);
  }
};

const recoverPendingStakes = async (
  tasksHavingPendingStake: TaskWithPendingStake[]
) => {
  for (const { taskAccountPubKey } of tasksHavingPendingStake) {
    try {
      await withdrawStake({} as Event, {
        taskAccountPubKey,
        shouldCheckCachedStake: false,
        taskType: 'KOII',
      });

      await sleep(10000);
      await claimReward({} as Event, {
        taskAccountPubKey,
      });

      await sleep(1000);
    } catch (error) {
      console.log(
        `Error recovering stake for task ${taskAccountPubKey}:`,
        error
      );
    }

    await sleep(1000);
  }
};
