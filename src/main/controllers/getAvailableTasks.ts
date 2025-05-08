/* eslint-disable camelcase */
import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';
import { ErrorType, PaginatedResponse, RawTaskData, Task } from 'models';
import { GetAvailableTasksParam } from 'models/api';
import { throwDetailedError } from 'utils';

import { parseRawK2TaskData } from '../node/helpers/parseRawK2TaskData';

const fetchDataWithTimeout = async (
  ids: string[],
  retryCount = 0
): Promise<any> => {
  const TIMEOUT = 30 * 1000;
  // Setting it to 0 for now we disable the main process' retries as the renderer already handles this, but we still need the timoeut to trigger it
  const MAX_RETRIES = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let timer: NodeJS.Timeout = setTimeout(() => {}, 0);
  clearTimeout(timer);

  try {
    const promise = koiiTasks.fetchTasksData(ids);
    const timeoutPromise = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('operation timed out'));
      }, TIMEOUT);
    });

    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (error: any) {
    clearTimeout(timer);

    if (retryCount < MAX_RETRIES) {
      console.error(`Error fetching available tasks: ${error.message}`);
      console.log(`Retrying to ${retryCount + 1}`);
      return fetchDataWithTimeout(ids, retryCount + 1);
    } else {
      throw error;
    }
  }
};

const getAvailableTasks = async (
  event: Event,
  payload: GetAvailableTasksParam
): Promise<PaginatedResponse<Task>> => {
  try {
    const { offset, limit } = payload;

    /**
     * @dev getting pre-fetched task-ids, which lives in the class instance property
     */
    const availableKoiiTaskIds: string[] = koiiTasks.allTaskPubkeys;
    const availableTasksIds: string[] = [
      ...availableKoiiTaskIds,
      ...koiiTasks.kplTaskPubKeys,
    ];

    const idsSlice = availableTasksIds.slice(offset, offset + limit);
    const runningIds = await koiiTasks.getStartedTasksPubKeys();

    const filteredIdsSlice = idsSlice.filter(
      (pubKey) => !runningIds.includes(pubKey)
    );

    const tasks: Task[] = (await fetchDataWithTimeout(filteredIdsSlice))
      .map((rawTaskData: RawTaskData) => {
        if (!rawTaskData) {
          return null;
        }

        return {
          publicKey: rawTaskData.task_id,
          data: parseRawK2TaskData({ rawTaskData }),
        };
      })
      .filter(
        (task: Task) =>
          task !== null && task.data.isWhitelisted && task.data.isActive
      );

    const response: PaginatedResponse<Task> = {
      content: tasks,
      hasNext: idsSlice.length === limit,
      itemsCount: availableTasksIds.length,
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

export default getAvailableTasks;
