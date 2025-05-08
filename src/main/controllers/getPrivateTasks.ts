/* eslint-disable @cspell/spellchecker */
/* eslint-disable camelcase */

import { MAINNET_QUERY_PARAM, SERVER_URL } from 'config/server';
import { getK2NetworkUrl } from 'main/node/helpers/k2NetworkUrl';
import koiiTasks from 'main/services/koiiTasks';
import {
  ErrorType,
  GetAvailableTasksParam,
  PaginatedResponse,
  RawTaskData,
  Task,
} from 'models';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import { throwDetailedError } from 'utils';

import { parseRawK2TaskData } from '../node/helpers/parseRawK2TaskData';

const fetchTasksWithTimeout = async (
  taskIds: string[],
  timeout = 5000
): Promise<any> => {
  const queryParams =
    getK2NetworkUrl() === MAINNET_RPC_URL ? MAINNET_QUERY_PARAM : '';
  const fetchWithTimeout = (taskId: string) => {
    return Promise.race([
      fetch(`${SERVER_URL}/get-task-details/${taskId}${queryParams}`).then(
        (response) => {
          if (!response.ok) {
            return {
              error: `Failed to fetch task ${taskId}: ${response.statusText}`,
            };
          }
          return response.json();
        }
      ),
      new Promise((resolve, reject) => {
        setTimeout(
          () => reject(new Error(`Timeout fetching task ${taskId}`)),
          timeout
        );
      }),
    ]).catch((error) => {
      return { error: error.message || `Error fetching task ${taskId}` };
    });
  };

  try {
    const fetchPromises = taskIds.map(fetchWithTimeout);
    const promises = await Promise.allSettled(fetchPromises);

    // this type assertion shouldn't be needed, but the compiler is fucking acting up
    const fulfilledPromises = promises.filter(
      (promise): promise is PromiseFulfilledResult<RawTaskData> =>
        promise.status === 'fulfilled'
    );
    const tasksData = fulfilledPromises.map((promise) => promise.value);

    return tasksData as RawTaskData[];
  } catch (error) {
    console.error('Error while fetching tasks:', error);
    return [];
  }
};

export const getPrivateTasks = async (
  event: Event,
  payload: GetAvailableTasksParam
): Promise<PaginatedResponse<Task>> => {
  try {
    const { offset, limit } = payload;

    const privateTaskIds: string[] = koiiTasks.privateTaskPubKeys;
    const runningIds = await koiiTasks.getStartedTasksPubKeys();

    const availablePrivateTasks = privateTaskIds.filter(
      (pubKey) => !runningIds.includes(pubKey)
    );

    const idsSlice = availablePrivateTasks.slice(offset, offset + limit);

    const tasks: Task[] = (await fetchTasksWithTimeout(idsSlice))
      .map((rawTaskData: RawTaskData) => {
        if (!rawTaskData) {
          return null;
        }

        return {
          publicKey: rawTaskData.task_id,
          data: parseRawK2TaskData({ rawTaskData }),
        };
      })
      .filter((task: Task) => task !== null && task.data.isActive);

    const hasNext = offset + limit < availablePrivateTasks.length;

    const response: PaginatedResponse<Task> = {
      content: tasks,
      hasNext,
      itemsCount: availablePrivateTasks.length,
    };

    return response;
  } catch (e: any) {
    if (e?.message !== 'Tasks not fetched yet') console.error(e);
    return throwDetailedError({
      detailed: e,
      type: ErrorType.GENERIC,
    });
  }
};
