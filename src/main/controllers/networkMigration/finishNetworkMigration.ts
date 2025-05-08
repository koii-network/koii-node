import { Event } from 'electron';
import * as fsSync from 'fs';

import { LAMPORTS_PER_SOL } from '@_koii/web3.js';
import axios, { AxiosError } from 'axios';
import { SERVER_URL } from 'config/server';
import { getAppDataPath } from 'main/node/helpers/getAppDataPath';
import { TaskToMigrate } from 'models';

import delegateStake from '../delegateStake';
import { getTaskInfo } from '../getTaskInfo';
import { getTasksToMigrate } from '../getTasksToMigrate';
import getUserConfig from '../getUserConfig';
import { initializeTasks } from '../initializeTasks';
import { setRunnedPrivateTask } from '../privateTasks';
import { setActiveAccount } from '../setActiveAccount';
import { storeTaskToMigrate } from '../storeTaskToMigrate';
import storeUserConfig from '../storeUserConfig';
import { getPairedTaskVariableData, pairTaskVariable } from '../taskVariables';

interface PublicKeys {
  oldPublicKey: string;
  newPublicKey: string;
}

export const finishNetworkMigration = async () => {
  const oldTasksToMigrate = await getTasksToMigrate();
  const oldTasksToMigrateWithPendingStake = Object.values(
    oldTasksToMigrate
  ).filter((task) => task.stake > 0);
  console.log(
    'MAINNET MIGRATION: starting 2nd phase of network migration for tasks: ',
    oldTasksToMigrate
  );

  let hasTaskMigrationErrors = false;

  for (const taskToMigrate of oldTasksToMigrateWithPendingStake) {
    try {
      await migrateTask(taskToMigrate);
      // in the case of migration retry, we don't want to attempt to re-stake on a task that has been already successfully migrated so we flag them with stake 0
      const taskToMigrateRecord = {
        ...taskToMigrate,
        stake: 0,
      };
      console.log(
        `MAINNET MIGRATION: Task ${taskToMigrate.publicKey} successfully migrated with stake of ${taskToMigrate.stake}`
      );
      await storeTaskToMigrate(taskToMigrateRecord);
    } catch (error) {
      if (error instanceof AxiosError) {
        const originalTaskIsOldAndInactive =
          error.response?.status === 422 || error.message.includes('422');
        if (!originalTaskIsOldAndInactive) {
          throw error.message || error;
        }
      }
      if (error instanceof Error && error.message === 'TASK_MIGRATION_ERROR') {
        hasTaskMigrationErrors = true;
        console.log(
          `MAINNET MIGRATION: Failed to migrate task ${taskToMigrate.publicKey}`
        );
        // eslint-disable-next-line no-continue
        continue;
      }
      throw error;
    }
  }

  await setNetworkMigrationAsFinished();
  console.log('MAINNET MIGRATION: finished 2nd phase of network migration');
  await initializeTasks();

  return { success: true, hasTaskMigrationErrors };
};

const migrateTask = async ({
  stake,
  publicKey: oldPublicKey,
  accountName,
}: TaskToMigrate) => {
  let newPublicKey;
  try {
    newPublicKey = await getNewTaskVersion(oldPublicKey);
  } catch (error) {
    if (error instanceof Error && error.message === 'TASK_MIGRATION_ERROR') {
      throw error;
    }
    throw error;
  }

  console.log(`MAINNET MIGRATION: setting ${accountName} as active account`);
  await setActiveAccount({} as Event, { accountName });
  console.log(`MAINNET MIGRATION: set ${accountName} as active account`);
  console.log(
    `MAINNET MIGRATION: migrating variables from old task ${oldPublicKey} to new task ${newPublicKey}`
  );
  await migrateTaskVariables({ oldPublicKey, newPublicKey });
  console.log(
    `MAINNET MIGRATION: migrated variables from old task ${oldPublicKey} to new task ${newPublicKey}`
  );
  console.log(
    `MAINNET MIGRATION: staking ${stake} on new task ${newPublicKey} from account ${accountName}`
  );

  const newTaskState = await getTaskInfo({} as Event, {
    taskAccountPubKey: newPublicKey,
    forceTaskRefetch: true,
  });

  await delegateStake({} as Event, {
    taskAccountPubKey: newPublicKey,
    stakeAmount: stake / LAMPORTS_PER_SOL,
    stakePotAccount: newTaskState.stakePotAccount,
    taskType: newTaskState.tokenType ? 'KPL' : 'KOII',
    mintAddress: newTaskState.tokenType,
  });

  console.log(
    `MAINNET MIGRATION: staked ${stake} on new task ${newPublicKey} from account ${accountName}`
  );
  console.log(
    `MAINNET MIGRATION: running new task ${newPublicKey} from account ${accountName}`
  );
  await setUpNewTaskAsStarted({
    taskPublicKey: newPublicKey,
    newTaskIsWhitelisted: newTaskState.isWhitelisted,
  });
  console.log(
    `MAINNET MIGRATION: runned new task ${newPublicKey} from account ${accountName}`
  );
};

const setNetworkMigrationAsFinished = async () => {
  const userConfig = await getUserConfig();
  await storeUserConfig({} as Event, {
    settings: { ...userConfig, hasFinishedTheMainnetMigration: true },
  });
};

const getNewTaskVersion = async (oldPublicKey: string) => {
  try {
    const response = await axios.get<{ migratedTo: string }>(
      `${SERVER_URL}/get-migrated-task/${oldPublicKey}`
    );
    return response.data.migratedTo;
  } catch (error) {
    throw new Error('TASK_MIGRATION_ERROR');
  }
};

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
    for (const [variableInTaskName, desktopVariableId] of Object.entries(
      oldTaskPairedTaskVariables
    )) {
      await pairTaskVariable({} as Event, {
        taskAccountPubKey: newPublicKey,
        variableInTaskName,
        desktopVariableId,
      });
    }
  }
};

const setUpNewTaskAsStarted = async ({
  taskPublicKey,
  newTaskIsWhitelisted,
}: {
  taskPublicKey: string;
  newTaskIsWhitelisted: boolean;
}) => {
  const newTaskIsPrivate = !newTaskIsWhitelisted;

  if (newTaskIsPrivate) {
    await setRunnedPrivateTask({} as Event, {
      runnedPrivateTask: taskPublicKey,
    });
  }

  fsSync.mkdirSync(`${getAppDataPath()}/namespace/${taskPublicKey}`, {
    recursive: true,
  });
};
