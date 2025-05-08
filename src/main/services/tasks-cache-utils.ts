import * as fs from 'fs';
import * as path from 'path';

import { isEmpty } from 'lodash';
import { RawTaskData, StakeList, StakingKeyString } from 'models';
import { wait } from 'utils/wait';

import { getAppDataPath } from '../node/helpers/getAppDataPath';

const appDataPath = getAppDataPath();
type CachedTaskType = Partial<RawTaskData>;
type CacheKey =
  | 'base'
  | 'submissions'
  | 'distributions'
  | 'availableBalances'
  | 'stakeList';

const getTaskCachePath = (taskId: string, key?: string) => {
  const basePath = path.join(appDataPath, 'namespace', taskId);
  const fileName = `${key || 'baseState'}.json`;
  const cachePath = path.join(basePath, 'cache', fileName);
  return cachePath;
};

export const getTaskDataFromCache = async (
  taskId: string,
  key?: CacheKey
): Promise<CachedTaskType | null> => {
  try {
    const taskCachePath = getTaskCachePath(taskId, key);
    const taskData = await fs.promises.readFile(taskCachePath, 'utf-8');
    const data = JSON.parse(taskData) as CachedTaskType;
    return data;
  } catch (error) {
    return {};
  }
};

const saveTaskDataToCache = async (
  taskId: string,
  taskData: Partial<RawTaskData>,
  key?: string
): Promise<void> => {
  try {
    const taskCachePath = getTaskCachePath(taskId, key);
    const taskDataString = JSON.stringify(taskData);
    const dirPath = path.dirname(taskCachePath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(taskCachePath, taskDataString);
  } catch (error) {
    console.error(
      `Error caching task ${key || 'base state'} for task ${taskId}`,
      error
    );
  }
};

export const getBaseDataFromCache = async (
  taskIds: string[]
): Promise<CachedTaskType[] | null> => {
  try {
    const promises = taskIds.map((taskId) => getTaskDataFromCache(taskId));
    const resolvedPromises = await Promise.allSettled(promises);

    const tasksFromCache = resolvedPromises
      .map((result) =>
        result.status === 'fulfilled' ? (result.value as RawTaskData) : null
      )
      .filter((result) => result !== null) as RawTaskData[];

    return tasksFromCache;
  } catch (error) {
    console.error('Error getting tasks from cache', error);
    return null;
  }
};

export const saveBaseStatesToCache = async (
  startedTasksData: CachedTaskType & { task_id: string }[]
) => {
  try {
    const promises = startedTasksData.map((taskData) =>
      saveTaskDataToCache(taskData.task_id, taskData)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving tasks to cache', error);
  }
};

export const getTasksFromCache = async (
  taskIds: string[]
): Promise<RawTaskData[] | null> => {
  try {
    const promises = taskIds.map((taskId) => getCompleteTaskFromCache(taskId));
    const resolvedPromises = await Promise.allSettled(promises);

    const tasksFromCache = resolvedPromises
      .map((result) =>
        result.status === 'fulfilled' ? (result.value as RawTaskData) : null
      )
      .filter((result) => result !== null) as RawTaskData[];

    return tasksFromCache;
  } catch (error) {
    console.error('Error getting tasks from cache', error);
    return null;
  }
};

export const saveStakeRecordToCache = async (
  taskId: string,
  stakingKey: StakingKeyString,
  stakeAmount: number,
  isAddition?: boolean
): Promise<void> => {
  try {
    const existingStakeList = await getTaskDataFromCache(taskId, 'stakeList');

    const newStakeAmount =
      stakeAmount === 0
        ? 0
        : isAddition
        ? (existingStakeList?.stake_list?.[stakingKey] || 0) + stakeAmount
        : stakeAmount;

    const updatedStakeList: StakeList = {
      ...existingStakeList?.stake_list,
      [stakingKey]: newStakeAmount,
    };

    await saveTaskDataToCache(
      taskId,
      { stake_list: updatedStakeList },
      'stakeList'
    );
  } catch (error) {
    console.error(
      `Error saving stake record to cache for task ${taskId}`,
      error
    );
  }
};

export const savePendingRewardsRecordToCache = async (
  taskId: string,
  stakingKey: StakingKeyString,
  rewardsAmount: number,
  isAddition?: boolean
): Promise<void> => {
  try {
    const existingBaseState = await getTaskDataFromCache(taskId);
    const existingAvailableBalances = existingBaseState?.available_balances;

    const newAmount = isAddition
      ? (existingAvailableBalances?.[stakingKey] || 0) + rewardsAmount
      : rewardsAmount;

    const updatedAvailableBalances = {
      ...(existingAvailableBalances || {}),
      [stakingKey]: newAmount,
    };

    await saveTaskDataToCache(taskId, {
      ...existingBaseState,
      available_balances: updatedAvailableBalances,
    });
  } catch (error) {
    console.error(
      `Error saving available balances record to cache for task ${taskId}`,
      error
    );
  }
};

export const getCompleteTaskFromCache = async (
  taskId: string
): Promise<CachedTaskType | null> => {
  try {
    const baseState = await getTaskDataFromCache(taskId);
    const submissions = await getTaskDataFromCache(taskId, 'submissions');
    const distributions = await getTaskDataFromCache(taskId, 'distributions');
    const availableBalances = await getTaskDataFromCache(
      taskId,
      'availableBalances'
    );
    const stakeList = await getTaskDataFromCache(taskId, 'stakeList');

    const completeTaskState = {
      ...baseState,
      ...submissions,
      ...distributions,
      ...availableBalances,
      ...stakeList,
    };
    if (isEmpty(baseState) || isEmpty(completeTaskState))
      throw new Error("There's no data in cache for this task.");
    return completeTaskState as unknown as RawTaskData;
  } catch (error) {
    console.error(
      `Error getting complete task from cache for task ${taskId}:`,
      error
    );
    return null;
  }
};

export const updateTaskCacheRecord = async (
  taskId: string,
  taskData: Partial<CachedTaskType>,
  key?: CacheKey
): Promise<void> => {
  try {
    await saveTaskDataToCache(taskId, taskData, key);
  } catch (error) {
    console.error(
      `Error updating task ${key || 'base state'} cache record`,
      error
    );
  }
};

export async function fetchWithRetry<T>(
  fetchFunction: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const result = await fetchFunction();
      return result;
    } catch (error) {
      console.error(`Failed to fetch data. Retry attempt: ${retryCount + 1}`);
      retryCount += 1;

      if (retryCount === maxRetries) {
        throw new Error('Failed to fetch data after maximum retries');
      }

      await wait(retryDelay * retryCount);
    }
  }

  throw new Error('Failed to fetch data');
}

export async function clearAllTaskCaches(): Promise<void> {
  try {
    const namespacePath = path.join(appDataPath, 'namespace');

    if (fs.existsSync(namespacePath)) {
      const taskFolders = await fs.promises.readdir(namespacePath);

      const clearCachePromises = taskFolders.map(async (taskFolder) => {
        const taskPath = path.join(namespacePath, taskFolder);
        const cachePath = path.join(taskPath, 'cache');

        if (fs.existsSync(cachePath)) {
          await fs.promises.rm(cachePath, { recursive: true });
          console.log(`Cache cleared for task ${taskFolder}`);
        }
      });

      await Promise.all(clearCachePromises);
      console.log('Cache cleared for all tasks');
    } else {
      console.log('No namespace folder found');
    }
  } catch (error) {
    console.error('Error clearing cache for all tasks:', error);
  }
}
