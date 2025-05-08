/* eslint-disable camelcase */
/* eslint-disable no-useless-catch */
/* eslint-disable class-methods-use-this */
import { ChildProcess } from 'child_process';
import fs from 'fs';

import { AccountInfo, MemcmpFilter, PublicKey } from '@_koii/web3.js';
import {
  getTaskState,
  getTaskStateKPL,
  getTaskSubmissionInfo,
  initialPropagation,
  IRunningTasks,
  ITaskNodeBase,
  KPL_CONTRACT_ID,
  runPeriodic,
  runTimers,
  updateRewardsQueue,
} from '@koii-network/task-node';
import { SERVER_URL } from 'config/server';
import getAverageSlotTime from 'main/controllers/getAverageSlotTime';
import getCurrentSlot from 'main/controllers/getCurrentSlot';
import { getKPLStakingAccountPubKey } from 'main/controllers/getKPLStakingAccountPubKey';
import { getNetworkUrl } from 'main/controllers/getNetworkUrl';
import getStakingAccountPubKey from 'main/controllers/getStakingAccountPubKey';
import { getTaskMetadata } from 'main/controllers/getTaskMetadata';
import { getMyTaskStake } from 'main/controllers/tasks';
import { getMainSystemAccountKeypair } from 'main/node/helpers';
import { electronStoreService } from 'main/node/helpers/electronStoreService';
import { getK2NetworkUrl } from 'main/node/helpers/k2NetworkUrl';
import { sleep } from 'main/util';
import { ErrorType } from 'models';
import {
  MAINNET_RPC_URL,
  TESTNET_RPC_URL,
} from 'renderer/features/shared/constants';
import { getProgramAccountFilter, throwDetailedError } from 'utils';

import { ATTENTION_TASK_ID, TASK_CONTRACT_ID } from '../../config/node';
import { SystemDbKeys } from '../../config/systemDbKeys';
import { getAppDataPath } from '../node/helpers/getAppDataPath';
import { namespaceInstance } from '../node/helpers/Namespace';

import { K2TasksDataFetchOptions } from './KoiiTaskService/types';
import sdk from './sdk';
import {
  fetchWithRetry,
  getCompleteTaskFromCache,
  getTaskDataFromCache,
  getTasksFromCache,
  saveBaseStatesToCache,
  updateTaskCacheRecord,
} from './tasks-cache-utils';

import type {
  RawTaskData,
  Submission,
  SubmissionsPerRound,
  TaskMetadata,
} from 'models';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

type EligibleTasksResponse = {
  eligibleTasks: string[];
};

function getLatestSubmission(
  publicKey: string,
  submissions: SubmissionsPerRound
): {
  latestSubmission: Submission | undefined;
  latestRound: number | undefined;
} {
  let latestSubmission: Submission | undefined;
  let latestRound: number | undefined;

  // eslint-disable-next-line guard-for-in
  for (const round in submissions) {
    const roundNumber = parseInt(round, 10);
    const submission = submissions[roundNumber][publicKey];

    if (
      submission &&
      (latestRound === undefined || roundNumber > latestRound)
    ) {
      latestSubmission = submission;
      latestRound = roundNumber;
    }
  }
  return { latestSubmission, latestRound };
}

export class KoiiTaskService {
  public RUNNING_TASKS: IRunningTasks<ITaskNodeBase> = {};

  public allTaskPubkeys: string[] = [];

  public kplTaskPubKeys: string[] = [];

  public privateTaskPubKeys: string[] = [];

  public timerForRewards = 0;

  private startedTasksData:
    | Omit<RawTaskData, 'is_running'>[]
    | null
    | undefined = [];

  private taskMetadata: any = {};

  private submissionCheckIntervals: Record<string, NodeJS.Timeout> = {};

  private submissionFetchingTimeouts: Record<string, NodeJS.Timeout> = {};

  private submissionFetchingIntervals: Record<string, NodeJS.Timer> = {};

  private isInitialized = false;

  public nodePropagationInterval: NodeJS.Timeout | null = null;

  updateStartedTasksData(
    taskId: string,
    updater: (
      task: Omit<RawTaskData, 'is_running'>
    ) => Omit<RawTaskData, 'is_running'>
  ) {
    this.startedTasksData = this.startedTasksData?.map((task) => {
      if (task.task_id === taskId) {
        return updater(task);
      }
      return task;
    });
  }

  /**
   * @dev: this functions is preparing the Koii Node to work in a few crucial steps:
   * 1. Fetch all tasks from the Task program
   * 2. Get the state of the tasks from the database
   * 3. Watch for changes in the tasks
   */
  async initializeTasks() {
    /**
     * @dev fetches all availbe tasks from K2
     */
    this.fetchAllTaskIds();
    /**
     * @dev get all started tassks and their newest state,
     * now we can get upgradeable tasks ids and filter them out from
     * availableTasksIds
     */
    const { upgradeableTaskIds } = await this.fetchStartedTaskData(true);
    this.allTaskPubkeys = this.allTaskPubkeys.filter(
      (taskPubKey) => !upgradeableTaskIds.includes(taskPubKey)
    );

    this.watchTasks();
  }

  async runTimers() {
    const kplTaskIds: string[] = [];
    const startedTasks = this.startedTasksData?.reduce((acc, task) => {
      if (this.RUNNING_TASKS[task.task_id]) {
        const isKplTask = !!task?.token_type;
        acc.push({
          ...task,
          task_type: isKplTask ? 'KPL' : 'KOII',
        });
        if (isKplTask) {
          kplTaskIds.push(task.task_id);
        }
      }
      return acc;
    }, [] as RawTaskData[]);

    if (!startedTasks) {
      return;
    }

    runTimers({
      KPL_tasks: kplTaskIds,
      selectedTasks: startedTasks,
      runningTasks: this.RUNNING_TASKS,
      setTimerForRewards: this.setTimerForRewards,
      networkURL: getNetworkUrl(),
    });
  }

  public stopSubmissionCheck(taskAccountPubKey: string): void {
    if (this.submissionCheckIntervals[taskAccountPubKey]) {
      clearInterval(this.submissionCheckIntervals[taskAccountPubKey]);
      delete this.submissionCheckIntervals[taskAccountPubKey]; // Remove the interval ID from the tracking object
    }
  }

  public stopSubmissionFetching(taskAccountPubKey: string): void {
    if (this.submissionFetchingTimeouts[taskAccountPubKey]) {
      clearTimeout(this.submissionFetchingTimeouts[taskAccountPubKey]);
      delete this.submissionFetchingTimeouts[taskAccountPubKey];
    }
    if (this.submissionFetchingIntervals[taskAccountPubKey]) {
      clearInterval(this.submissionFetchingIntervals[taskAccountPubKey]);
      delete this.submissionFetchingIntervals[taskAccountPubKey];
    }
  }

  public getTaskByTaskAuditProgramId(taskAuditProgramId: string) {
    return this.startedTasksData?.find((task) => {
      return task.task_audit_program === taskAuditProgramId;
    });
  }

  public async getTaskStateKPL(
    taskAccountPubKey: string,
    options?: K2TasksDataFetchOptions
  ): Promise<RawTaskData> {
    console.log('attempting to fetch KPL task state for ', taskAccountPubKey);
    try {
      const result = await getTaskStateKPL(
        sdk.k2Connection,
        taskAccountPubKey,
        {
          is_available_balances_required: options?.withAvailableBalances,
          is_distribution_required: options?.withDistributions,
          is_stake_list_required: options?.withStakeList,
          is_submission_required: options?.withSubmissions,
        }
      );

      const taskData = {
        ...result,
        task_id: taskAccountPubKey,
        task_type: 'KPL',
      } as any;

      return taskData;
    } catch (error) {
      console.error('error fetching KPL task state', error);
      throw error;
    }
  }

  public async getTaskStateKOII(
    taskAccountPubKey: string,
    options?: K2TasksDataFetchOptions
  ): Promise<any> {
    console.log('attempting to fetch KOII task state for ', taskAccountPubKey);
    try {
      const result = await getTaskState(sdk.k2Connection, taskAccountPubKey, {
        is_available_balances_required: options?.withAvailableBalances,
        is_distribution_required: options?.withDistributions,
        is_stake_list_required: options?.withStakeList,
        is_submission_required: options?.withSubmissions,
      });

      if (!result || !(result as RawTaskData).task_name) {
        throw new Error('task data not found');
      }

      const taskData = {
        ...result,
        task_id: taskAccountPubKey,
        task_type: 'KOII',
      } as RawTaskData;

      return taskData;
    } catch (error) {
      console.error('error fetching KOII task state', error);
      throw error;
    }
  }

  public async getTaskState(
    taskAccountPubKey: string,
    options?: K2TasksDataFetchOptions
  ): Promise<RawTaskData> {
    try {
      const taskIsKOIIType = this.allTaskPubkeys.includes(taskAccountPubKey);
      const taskIsKPLType = this.kplTaskPubKeys.includes(taskAccountPubKey);
      if (taskIsKOIIType) {
        return this.getTaskStateKOII(taskAccountPubKey, options);
      } else if (taskIsKPLType) {
        return this.getTaskStateKPL(taskAccountPubKey, options);
      } else {
        try {
          return await this.getTaskStateKPL(taskAccountPubKey, options);
        } catch (error) {
          try {
            return await this.getTaskStateKOII(taskAccountPubKey, options);
          } catch (error) {
            throw error;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async checkTaskSubmission(task: RawTaskData) {
    const stakingPublicKey = await getStakingAccountPubKey();

    const currentSlot = await getCurrentSlot();
    const currentRound = Math.floor(
      (currentSlot - task.starting_slot) / task.round_time
    );
    const submissionsInCache =
      (await getTaskDataFromCache(task.task_id, 'submissions'))?.submissions ||
      {};
    const latestSubmissionData = getLatestSubmission(
      stakingPublicKey,
      submissionsInCache
    );
    const submissionsAreTooOutdated =
      !latestSubmissionData?.latestRound ||
      (latestSubmissionData?.latestRound &&
        currentRound - latestSubmissionData.latestRound > 3);

    const runningTask = this.RUNNING_TASKS[task.task_id];

    const stopSubmissionCheckAndRetry = () => {
      this.stopSubmissionCheck(task.task_id);
      this.stopSubmissionFetching(task.task_id);
      runningTask.child.kill('SIGTERM');
      // TO DO: find why sometimes kill() doesn't trigger the exit event and we have to emit it manually
      runningTask.child.emit('exit', 0, null);
    };

    if (!!runningTask && submissionsAreTooOutdated) {
      stopSubmissionCheckAndRetry();
    }
  }

  private watchTasks() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    setInterval(() => {
      try {
        this.fetchAllTaskIds();
        this.fetchStartedTaskData();
      } catch (e) {
        console.error(e);
      }
    }, FIFTEEN_MINUTES_IN_MS);
  }

  async getStartedTasks(force?: boolean): Promise<RawTaskData[]> {
    if (force) {
      await this.fetchStartedTaskData();
    }

    while (!this.isInitialized) {
      await sleep(1000);
    }

    if (!this.startedTasksData) {
      const startedTasksPubKeys: Array<string> =
        await this.getStartedTasksPubKeys();

      // Try to load from cache if the data has not been fetched
      const cachedData = await getTasksFromCache(startedTasksPubKeys);

      if (cachedData) {
        this.startedTasksData = cachedData;
      } else {
        // try to refetch the data with 3 retries, if there is no cache available
        await fetchWithRetry(this.fetchStartedTaskData);
      }
    }

    return (this.startedTasksData ?? []).map((task) => ({
      ...task,
      is_running: Boolean(this.RUNNING_TASKS[task.task_id]),
    }));
  }

  async startTask(
    taskAccountPubKey: string,
    namespace: ITaskNodeBase,
    childTaskProcess: ChildProcess,
    expressAppPort: number,
    secret: string,
    taskInfo?: RawTaskData
  ): Promise<void> {
    this.RUNNING_TASKS[taskAccountPubKey] = {
      namespace,
      child: childTaskProcess,
      expressAppPort,
      secret,
    };

    await this.addRunningTaskPubKey(taskAccountPubKey);

    try {
      if (this.nodePropagationInterval) {
        clearInterval(this.nodePropagationInterval);
      }
      this.stopSubmissionCheck(taskAccountPubKey);
      this.stopSubmissionFetching(taskAccountPubKey);
      const runningTasks = (await this.getStartedTasks()).filter((task) => {
        return !!this.RUNNING_TASKS[task.task_id];
      });
      const curr_subDomain = await namespaceInstance.storeGet('subdomain');
      const mainSystemAccount = await getMainSystemAccountKeypair();
      initialPropagation(
        runningTasks,
        ATTENTION_TASK_ID,
        namespaceInstance,
        mainSystemAccount,
        `http://${curr_subDomain}`,
        true
      ).then(() => {
        this.nodePropagationInterval = setInterval(
          () =>
            runPeriodic(
              runningTasks,
              namespaceInstance,
              mainSystemAccount,
              `http://${curr_subDomain}`,
              true
            ),
          300000
        );
      });
    } catch (error: any) {
      console.error(error.message);
    }

    const submissionsInCache =
      (await getTaskDataFromCache(taskAccountPubKey, 'submissions'))
        ?.submissions || {};
    // Add task to the started tasks data
    if (taskInfo && this.startedTasksData) {
      const taskIndex = this.startedTasksData?.findIndex(
        (task) => task.task_id === taskAccountPubKey
      );

      if (taskIndex !== undefined && taskIndex !== -1) {
        const newTaskData = {
          ...taskInfo,
          available_balances:
            this.startedTasksData[taskIndex]?.available_balances || {},
          submissions: this.startedTasksData[taskIndex]?.submissions || {},
        };
        this.startedTasksData[taskIndex] = newTaskData;
      } else {
        this.startedTasksData.push(taskInfo);
      }
    }

    const taskRawData = this.startedTasksData?.find(
      (task) => task.task_id === taskAccountPubKey
    );

    await this.runTimers();

    if (!taskRawData) {
      return;
    }
    const averageSlotTime = await getAverageSlotTime();
    const roundTimeInMs = taskRawData.round_time * averageSlotTime;

    const currentSlot = await getCurrentSlot();
    const slotsSinceTaskCreation = currentSlot - taskRawData.starting_slot;
    const roundsSinceTaskCreation =
      slotsSinceTaskCreation / taskRawData.round_time;
    const roundFractionMissingToCompleteCurrentRound =
      roundsSinceTaskCreation % 1;
    const slotsToCompleteCurrentRound =
      roundFractionMissingToCompleteCurrentRound * taskRawData.round_time;
    const slotsToWaitBeforeFetchingSubmission =
      slotsToCompleteCurrentRound + taskRawData.submission_window;
    const timeToWaitBeforeFetchingSubmissionInMs =
      slotsToWaitBeforeFetchingSubmission * averageSlotTime;

    const fetchSubmissions = async () => {
      console.log('fetching submissions for task', taskAccountPubKey);
      const taskSubmissions = await getTaskSubmissionInfo(
        sdk.k2Connection,
        taskAccountPubKey,
        taskRawData.task_type
      );
      console.log('fetched submissions for task', taskAccountPubKey);
      await updateTaskCacheRecord(
        taskAccountPubKey,
        taskSubmissions,
        'submissions'
      );
    };

    const currentRound = Math.floor(
      (currentSlot - taskRawData.starting_slot) / taskRawData.round_time
    );
    const correspondingStakingPublicKey = taskRawData.token_type
      ? await getKPLStakingAccountPubKey()
      : await getStakingAccountPubKey();

    const latestSubmissionData = getLatestSubmission(
      correspondingStakingPublicKey,
      submissionsInCache
    );
    const submissionsAreTooOutdated =
      latestSubmissionData?.latestRound &&
      currentRound - latestSubmissionData.latestRound >= 3;
    if (submissionsAreTooOutdated) {
      console.log(
        'fetching submissions when starting task because cache is outdated'
      );
      await fetchSubmissions();
    }
    this.submissionFetchingTimeouts[taskAccountPubKey] = setTimeout(
      async () => {
        await fetchSubmissions();
        const submissionsFetchingInterval = setInterval(async () => {
          const taskIsRunning = !!this.RUNNING_TASKS[taskAccountPubKey];
          const makeSureToClearInterval = () => {
            this.stopSubmissionFetching(taskAccountPubKey);
            clearInterval(submissionsFetchingInterval);
          };
          if (taskIsRunning) {
            await fetchSubmissions();
          } else {
            makeSureToClearInterval();
          }
        }, roundTimeInMs);
        this.submissionFetchingIntervals[taskAccountPubKey] =
          submissionsFetchingInterval;
      },
      timeToWaitBeforeFetchingSubmissionInMs
    );

    const taskIndex = this.startedTasksData?.findIndex(
      (task) => task.task_id === taskAccountPubKey
    );
    const baseTimeIntervalForSubmissionsCheck = 3.5 * roundTimeInMs;
    const safeIntervalDelay = ((taskIndex || 0) + 1) * 30 * 1000;
    const finalTimeInterval =
      baseTimeIntervalForSubmissionsCheck + safeIntervalDelay;

    this.submissionCheckIntervals[taskAccountPubKey] = setInterval(() => {
      const taskRawData = this.startedTasksData?.find(
        (task) => task.task_id === taskAccountPubKey
      );

      if (taskRawData) {
        this.checkTaskSubmission(taskRawData);
      }
    }, finalTimeInterval);
  }

  async setTimerForRewards(value: number) {
    electronStoreService.setTimeToNextRewardAsSlots(value);
  }

  async updateRewardsQueue() {
    const kplTaskIds =
      this.startedTasksData
        ?.filter((task) => !!task?.token_type)
        .map((task) => task.task_id) || [];

    await updateRewardsQueue(
      kplTaskIds,
      this.setTimerForRewards,
      sdk.k2Connection
    );
  }

  stopTasksOnAppQuit() {
    const runningTasks = Object.keys(this.RUNNING_TASKS) || [];
    runningTasks.forEach((taskPubKey) => {
      this.RUNNING_TASKS[taskPubKey].child.kill('SIGTERM');
      this.RUNNING_TASKS[taskPubKey].child.emit('exit', null, null);
    });
  }

  async stopTask(
    taskAccountPubKey: string,
    skipRemoveFromRunningTasks?: boolean
  ) {
    if (!this.RUNNING_TASKS[taskAccountPubKey]) {
      return throwDetailedError({
        detailed: 'No such task is running',
        type: ErrorType.NO_RUNNING_TASK,
      });
    }

    this.RUNNING_TASKS[taskAccountPubKey].child.kill('SIGTERM');
    // TO DO: find why sometimes kill() doesn't trigger the exit event and we have to emit it manually
    this.RUNNING_TASKS[taskAccountPubKey].child.emit('exit', null, null);

    this.stopSubmissionCheck(taskAccountPubKey);
    this.stopSubmissionFetching(taskAccountPubKey);

    delete this.RUNNING_TASKS[taskAccountPubKey];

    if (!skipRemoveFromRunningTasks) {
      await this.removeRunningTaskPubKey(taskAccountPubKey);
    }

    await this.runTimers();

    try {
      if (this.nodePropagationInterval) {
        clearInterval(this.nodePropagationInterval);
      }
      const runningTasks = (await this.getStartedTasks()).filter((task) => {
        return !!this.RUNNING_TASKS[task.task_id];
      });
      const mainSystemAccount = await getMainSystemAccountKeypair();
      const curr_subDomain = await namespaceInstance.storeGet('subdomain');
      console.log('curr_subDomain', curr_subDomain);
      initialPropagation(
        runningTasks,
        ATTENTION_TASK_ID,
        namespaceInstance,
        mainSystemAccount,
        `http://${curr_subDomain}`,
        true
      ).then(() => {
        this.nodePropagationInterval = setInterval(
          () =>
            runPeriodic(
              runningTasks,
              namespaceInstance,
              mainSystemAccount,
              `http://${curr_subDomain}`,
              true
            ),
          600000
        );
      });
    } catch (error: any) {
      console.error(error.message);
    }
  }

  async fetchAllTaskIds() {
    try {
      const getTaskPubkeys = async (
        programId: string | PublicKey,
        filters: MemcmpFilter[],
        dataSlice?: { offset: number; length: number }
      ) => {
        try {
          const url = `https://k2-cache.koii.network/api/get-program-accounts?programId=${programId}&dataSlice_offset=${
            dataSlice?.offset || 0
          }&dataSlice_length=${dataSlice?.length || 0}&memcmp_offset=${
            filters[0]?.memcmp?.offset || 0
          }&memcmp_bytes=${filters[0].memcmp?.bytes || ''}`;
          const response = await fetch(url);
          console.log({ url });

          if (!response.ok) {
            throw new Error('Failed to fetch task accounts from cache server');
          }

          const accounts = (await response.json()) as {
            pubkey: PublicKey;
            account: AccountInfo<Buffer>;
          }[];

          return accounts.map(({ pubkey }) => pubkey as unknown as string);
        } catch (error) {
          console.error(error);
          const accounts = await sdk.k2Connection.getProgramAccounts(
            new PublicKey(programId),
            {
              dataSlice,
              filters,
            }
          );

          return accounts.map(({ pubkey }) => pubkey.toBase58());
        }
      };

      const networkUrl = getK2NetworkUrl();
      const networkFlag =
        networkUrl === MAINNET_RPC_URL
          ? 'mainnet'
          : networkUrl === TESTNET_RPC_URL
          ? 'testnet'
          : 'devnet';
      const privateTasksUrl = `${SERVER_URL}/get-eligible-tasks?is_allowlisted=false&endpoint=${networkFlag}`;

      console.log('privateTasksUrl', privateTasksUrl, getK2NetworkUrl());

      const results = await Promise.allSettled([
        getTaskPubkeys(
          process.env.TASK_CONTRACT_ID || TASK_CONTRACT_ID,
          getProgramAccountFilter(),
          {
            offset: 0,
            length: 0,
          }
        ),
        getTaskPubkeys(KPL_CONTRACT_ID, [
          {
            memcmp: {
              offset: 0,
              bytes: '5S',
            },
          },
        ]),
        fetch(privateTasksUrl, {
          method: 'GET',
        }).then((response) => response.json() as Promise<string[]>),
      ]);

      console.log('task ids', results);

      // Handle each result individually, preserving existing values if a fetch fails
      if (results[0].status === 'fulfilled') {
        this.allTaskPubkeys = results[0].value;
      }

      if (results[1].status === 'fulfilled') {
        this.kplTaskPubKeys = results[1].value.filter(
          (taskPubKey) =>
            ![
              'BAXsyoApqUjrRBXF8DdrcZrn6AMiCjdffTKgPf3AQW6w',
              'FPfjumESueM9WpTQT1nHrMQdTCzigh95JAS7Q48gop4y',
            ].includes(taskPubKey)
        );
      }

      if (results[2].status === 'fulfilled') {
        this.privateTaskPubKeys = results[2].value;
      } else {
        console.error('Failed to fetch private tasks:', results[2].reason);
        // Keep existing privateTaskPubKeys if fetch fails
      }
    } catch (err) {
      console.error('Error in fetchAllTaskIds:', err);
    }
  }

  public async addRunningTaskPubKey(pubkey: string) {
    const currentlyRunningTaskIds: Array<string> = Array.from(
      new Set([...(await this.getRunningTaskPubKeys()), pubkey])
    );
    await namespaceInstance.storeSet(
      SystemDbKeys.RunningTasks,
      JSON.stringify(currentlyRunningTaskIds)
    );
  }

  public async getIsTaskRunning(pubkey: string) {
    const isTaskRunning = !!this.RUNNING_TASKS[pubkey];
    return isTaskRunning;
  }

  /**
   * @dev store running tasks
   */
  private async removeRunningTaskPubKey(pubkey: string) {
    const currentlyRunningTaskIds: Array<string> =
      await this.getRunningTaskPubKeys();
    const isTaskRunning = currentlyRunningTaskIds.includes(pubkey);

    if (isTaskRunning) {
      const actualRunningTaskIds = currentlyRunningTaskIds.filter(
        (taskPubKey) => {
          return taskPubKey !== pubkey;
        }
      );

      await namespaceInstance.storeSet(
        SystemDbKeys.RunningTasks,
        JSON.stringify(actualRunningTaskIds)
      );
    } else {
      /**
       * @dev we cant throw error here, because it iwll interrupt the stopTask process
       */
      console.error(`Task ${pubkey} is not running`);
    }
  }

  async getRunningTaskPubKeys(): Promise<string[]> {
    const runningTasksStr: string | undefined =
      await namespaceInstance.storeGet(SystemDbKeys.RunningTasks);
    try {
      const startedTasks = await this.getStartedTasksPubKeys();
      const runningTasks = (
        runningTasksStr ? (JSON.parse(runningTasksStr) as Array<string>) : []
      ).filter((task) => startedTasks.includes(task));

      return runningTasks;
    } catch (e) {
      return [];
    }
  }

  async getStartedTasksPubKeys(): Promise<string[]> {
    const files = fs.readdirSync(`${getAppDataPath()}/namespace`, {
      withFileTypes: true,
    });

    const startedTasksPubKeys = files
      .filter((item) => item.isDirectory() && item.name.length > 40)
      /**
       * @dev we are using the name of the directory as the task pubkey
       */
      .map((item) => item.name);
    return startedTasksPubKeys;
  }

  removeTaskFromStartedTasks(taskPubKey: string) {
    // if is running, stop it
    if (this.RUNNING_TASKS[taskPubKey]) {
      this.RUNNING_TASKS[taskPubKey].child.kill();
      delete this.RUNNING_TASKS[taskPubKey];
    }

    // remove from started tasks data
    this.startedTasksData = this.startedTasksData?.filter(
      (task) => task.task_id !== taskPubKey
    );

    // remove from filesystem
    fs.rmdirSync(`${getAppDataPath()}/namespace/${taskPubKey}`, {
      recursive: true,
    });
  }

  async fetchTasksData(
    pubkeys: string[],
    options?: K2TasksDataFetchOptions
  ): Promise<(RawTaskData | null)[]> {
    const taskDataPromises = pubkeys.map(async (pubkey) => {
      try {
        const taskData = await this.getTaskState(pubkey, options);

        if (!taskData) {
          return null;
        }

        return taskData;
      } catch (error) {
        // handleTaskNotFoundError(pubkey, error);
        return null;
      }
    });

    return Promise.all(taskDataPromises);
  }

  async findLatestTaskVersion(taskId: string): Promise<string | null> {
    const task = await this.getTaskState(taskId, {
      withAvailableBalances: false,
    });

    if (task.migrated_to) {
      return this.findLatestTaskVersion(task.migrated_to);
    }
    if (!task.is_active) {
      return null;
    }
    return taskId;
  }

  async fetchStartedTaskData(
    isInitializingNode?: boolean
  ): Promise<{ upgradeableTaskIds: string[] }> {
    const upgradeableTaskIds: string[] = [];
    const startedTasksPubKeys: Array<string> =
      await this.getStartedTasksPubKeys();

    if (startedTasksPubKeys.length === 0) {
      this.startedTasksData = [];
      return { upgradeableTaskIds: [] };
    }

    const fetchTaskWithTimeout = async (pubkey: string) => {
      const TIMEOUT_MS = 30000; // 30 seconds timeout

      try {
        // eslint-disable-next-line promise/param-names
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS);
        });

        const taskPromise = (async () => {
          const existingStateFromClass = this.startedTasksData?.find(
            (task) => task.task_id === pubkey
          );
          const existingStateFromCache = await getCompleteTaskFromCache(pubkey);
          const existingState =
            existingStateFromClass || existingStateFromCache;

          const taskData = await this.getTaskState(pubkey, {
            withAvailableBalances: true,
          });

          if (taskData.migrated_to) {
            const newTaskVersionId = await this.findLatestTaskVersion(
              taskData.migrated_to
            );
            if (newTaskVersionId) {
              upgradeableTaskIds.push(newTaskVersionId);
              taskData.migrated_to = newTaskVersionId;
            }
          }

          if (isInitializingNode) {
            await getMyTaskStake({} as Event, {
              taskAccountPubKey: pubkey,
              revalidate: true,
              taskType: taskData.task_type || existingState?.task_type,
            });
          }

          const isKPLTask = !!taskData.token_type;
          return {
            ...taskData,
            task_type: isKPLTask ? 'KPL' : 'KOII',
            submissions: existingStateFromCache?.submissions,
          };
        })();

        return await Promise.race([taskPromise, timeoutPromise]);
      } catch (error) {
        console.log(
          `Timeout or error fetching task ${pubkey}, falling back to cache`
        );
        const cachedData = await getCompleteTaskFromCache(pubkey);
        if (cachedData) {
          const isKPLTask = !!cachedData.token_type;
          return {
            ...cachedData,
            task_type: isKPLTask ? 'KPL' : 'KOII',
          };
        }
        throw error;
      }
    };

    const results = await Promise.allSettled(
      startedTasksPubKeys.map((pubkey) => fetchTaskWithTimeout(pubkey))
    );

    const filteredResults = results.filter(
      (result) => result.status === 'fulfilled'
    ) as PromiseFulfilledResult<RawTaskData>[];

    const promisesData = filteredResults.map((result) => result.value);

    if (promisesData.length === 0) {
      this.startedTasksData = null;
    } else {
      this.startedTasksData = promisesData;
      await saveBaseStatesToCache(promisesData);
    }

    return { upgradeableTaskIds };
  }

  async getTaskMetadataUtil(metadataCID: string): Promise<TaskMetadata> {
    if (this.taskMetadata[metadataCID]) {
      return this.taskMetadata[metadataCID];
    }
    const taskMetadata = await getTaskMetadata({} as Event, {
      metadataCID,
    });
    this.taskMetadata[metadataCID] = taskMetadata;
    return taskMetadata;
  }
}
