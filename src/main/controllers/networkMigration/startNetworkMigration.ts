import { Event } from 'electron';

import { AxiosError } from 'axios';
import koiiTasks from 'main/services/koiiTasks';
import { OwnerAccount, TaskData, getAllAccountsResponse } from 'models';
import { NetworkUrlType } from 'renderer/features/shared/constants';

import { appRelaunch } from '../appRelaunch';
import claimReward from '../claimReward';
import { claimRewardKPL } from '../claimRewardKPL';
import getActiveAccountName from '../getActiveAccountName';
import { getAllAccounts } from '../getAllAccounts';
import { getTaskInfo } from '../getTaskInfo';
import { getTasksToMigrate } from '../getTasksToMigrate';
import getUserConfig from '../getUserConfig';
import { setActiveAccount } from '../setActiveAccount';
import { storeTaskToMigrate } from '../storeTaskToMigrate';
import storeUserConfig from '../storeUserConfig';
import { switchNetwork } from '../switchNetwork';
// import withdrawStake from '../withdrawStake';

export const startNetworkMigration = async (
  _: Event,
  networkRpcUrl: NetworkUrlType
) => {
  const originallyActiveAccount = await getActiveAccountName();
  console.log('MAINNET MIGRATION: starting 1st phase of network migration');

  const allMyTasks = await koiiTasks.getStartedTasksPubKeys();
  console.log({ allMyTasks });

  const taskStates = await Promise.all(
    allMyTasks.map((taskPublicKey) =>
      getTaskInfo(
        {} as Event,
        {
          taskAccountPubKey: taskPublicKey,
          forceTaskRefetch: true,
        },
        undefined,
        {
          withStakeList: true,
          // withAvailableBalances: true,
        }
      ).catch((error) => {
        try {
          const errorDetails = JSON.parse(error.message) as {
            detailed: string;
          };
          if (
            errorDetails.detailed?.includes('Invalid public key input') ||
            errorDetails.detailed?.includes('Non-base58 character') ||
            errorDetails.detailed?.includes(
              'Cannot find the task contract data'
            )
          ) {
            console.log(`Task not found for public key: ${taskPublicKey}`);
            return null;
          }
        } catch (parseError) {
          console.log('Failed to parse error:', parseError);
          return null;
        }
        console.log(`Error getting task info for ${taskPublicKey}:`, error);
        return null;
      })
    )
  );

  const taskStateMap = Object.fromEntries(
    allMyTasks
      .map((publicKey, index) => [publicKey, taskStates[index]])
      .filter(([_, state]) => state !== null)
  );

  await recordAllTasksAndStakes(taskStateMap, originallyActiveAccount);

  await setActiveAccount({} as Event, {
    accountName: originallyActiveAccount,
  });

  await changeToNewNetworkRPCUrl(networkRpcUrl);

  const userConfig = await getUserConfig();
  await storeUserConfig({} as Event, {
    settings: { ...userConfig, hasStartedTheMainnetMigration: true },
  });
  await archiveOldTasks();
  console.log('MAINNET MIGRATION: finished 1st phase of network migration');
  appRelaunch({} as Event);
};

const archiveOldTasks = async () => {
  const tasksFromOldNetwork = await koiiTasks.getStartedTasksPubKeys();

  tasksFromOldNetwork.forEach((taskPublicKey) =>
    koiiTasks.removeTaskFromStartedTasks(taskPublicKey)
  );
};

const recordAllTasksAndStakes = async (
  taskStateMap: Record<string, TaskData>,
  originallyActiveAccount: string
) => {
  const allAccounts = await getAllAccounts({} as Event, false);

  for (const account of allAccounts) {
    console.log(
      `MAINNET MIGRATION: setting account ${account.accountName} as active account`
    );
    await setActiveAccount({} as Event, { accountName: account.accountName });
    console.log(
      `MAINNET MIGRATION: set account ${account.accountName} as active account`
    );
    await recordTasksAndStakesForAccount(
      account,
      taskStateMap,
      originallyActiveAccount
    );
  }
};

const claimRewardsFromTask = async (
  taskPublicKey: string,
  tokenType?: string,
  stakePotAccount?: string
) => {
  try {
    const functionToClaimRewards = tokenType ? claimRewardKPL : claimReward;

    await functionToClaimRewards({} as Event, {
      taskAccountPubKey: taskPublicKey,
      tokenType: tokenType || 'KOII',
      stakePotAccount,
    });
  } catch (error: any) {
    const taskDidntHaveRewardsToClaim = error?.message?.includes(
      "The provided claimer account doesn't have any balance on task state"
    );
    if (!taskDidntHaveRewardsToClaim) {
      throw error;
    }
  }
};

const recordTasksAndStakesForAccount = async (
  account: getAllAccountsResponse[0],
  taskStateMap: Record<string, TaskData>,
  originallyActiveAccount: string
) => {
  for (const taskPublicKey of Object.keys(taskStateMap)) {
    try {
      const taskType = taskStateMap[taskPublicKey]?.tokenType ? 'KPL' : 'KOII';
      const correspondingStakingKey =
        taskType === 'KPL'
          ? account.kplStakingPublicKey!
          : account.stakingPublicKey;
      const stakeOnTask =
        taskStateMap[taskPublicKey]?.stakeList?.[correspondingStakingKey] || 0;
      const hasStakeOnTask = stakeOnTask > 0;

      if (hasStakeOnTask) {
        await recordTaskAndStake(taskPublicKey, account, stakeOnTask);
        // console.log(
        //   `MAINNET MIGRATION: withdrawing stake from task ${taskPublicKey} for account ${account.accountName}`
        // );
        // await withdrawStake({} as Event, {
        //   taskAccountPubKey: taskPublicKey,
        //   taskType,
        // });
        // console.log(
        //   `MAINNET MIGRATION: withdrew stake on task ${taskPublicKey} for account ${account.accountName}`
        // );
        // await sleep(5000);
        // console.log(
        //   `MAINNET MIGRATION: claiming rewards from task ${taskPublicKey} for account ${account.accountName}`
        // );
        // await claimRewardsFromTask(
        //   taskPublicKey,
        //   taskStateMap[taskPublicKey].tokenType,
        //   taskStateMap[taskPublicKey].stakePotAccount
        // );
        // console.log(
        //   `MAINNET MIGRATION: claimed rewards from task ${taskPublicKey} for account ${account.accountName}`
        // );
      } else {
        console.log(
          `MAINNET MIGRATION: no stake on task ${taskPublicKey} from account ${account.accountName}`
        );
        // const hasRewardsToClaim =
        //   taskStateMap[taskPublicKey]?.availableBalances?.[
        //     correspondingStakingKey
        //   ] || 0;
        // if (hasRewardsToClaim) {
        //   console.log(
        //     `MAINNET MIGRATION: claiming rewards from task ${taskPublicKey} for account ${account.accountName}`
        //   );
        //   await claimRewardsFromTask(
        //     taskPublicKey,
        //     taskStateMap[taskPublicKey].tokenType,
        //     taskStateMap[taskPublicKey].stakePotAccount
        //   );
        //   console.log(
        //     `MAINNET MIGRATION: claimed rewards from task ${taskPublicKey} for account ${account.accountName}`
        //   );
        // }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('MAINNET MIGRATION: error while recording task: ', error);
        const taskIsOldAndInactive =
          error.response?.data.message.includes('not a valid taskID');
        if (!taskIsOldAndInactive) {
          throw error;
        }
      } else if ((error as any)?.message?.includes('Voting ongoing on round')) {
        throw new Error(
          JSON.stringify({
            type: 'ACTIVE_VOTING_ROUND',
            detailed:
              'Cannot migrate network while tasks are in active voting rounds. Please wait for all tasks to complete their current rounds and try again.',
          })
        );
      }
      await setActiveAccount({} as Event, {
        accountName: originallyActiveAccount,
      });
      throw error;
    }
  }
};

const recordTaskAndStake = async (
  taskPublicKey: string,
  account: OwnerAccount,
  stakeOnTask: number
) => {
  const taskToMigrateRecord = {
    publicKey: taskPublicKey,
    stake: stakeOnTask,
    ...account,
  };
  console.log(
    `MAINNET MIGRATION: recording task ${taskPublicKey} with stake ${stakeOnTask}, from account ${account.accountName}`
  );
  await storeTaskToMigrate(taskToMigrateRecord);
  const newTaskToMigrate = await getTasksToMigrate();

  console.log({ newTaskToMigrate });
  console.log(
    `MAINNET MIGRATION: recorded task ${taskPublicKey} with stake ${stakeOnTask}, from account ${account.accountName}`
  );
};

const changeToNewNetworkRPCUrl = async (networkRpcUrl: NetworkUrlType) =>
  switchNetwork({} as Event, networkRpcUrl);
