import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';
import { K2TasksDataFetchOptions } from 'main/services/KoiiTaskService/types';
import {
  ErrorType,
  GetTaskInfoParam,
  GetTaskInfoResponse,
  RawTaskData,
} from 'models';
import { throwDetailedError } from 'utils/error';

import { parseRawK2TaskData } from '../node/helpers/parseRawK2TaskData';

export const getTaskInfo = async (
  _: Event,
  payload: GetTaskInfoParam,
  context?: string,
  options?: K2TasksDataFetchOptions
): Promise<GetTaskInfoResponse> => {
  const { taskAccountPubKey, forceTaskRefetch } = payload;

  try {
    let partialRawTaskData;
    if (!forceTaskRefetch) {
      partialRawTaskData = (await koiiTasks.getStartedTasks()).find(
        (task) => task.task_id === taskAccountPubKey
      );
    }

    //  If task is not in started tasks, fetch its state from K2 as a fallback
    if (!partialRawTaskData || forceTaskRefetch) {
      partialRawTaskData = (await koiiTasks.getTaskState(
        taskAccountPubKey,
        options
      )) as RawTaskData;
    }

    if (!partialRawTaskData) {
      console.error(`Task ${taskAccountPubKey} not found`);
      return throwDetailedError({
        detailed: 'Task not found',
        type: ErrorType.TASK_NOT_FOUND,
      });
    }

    return parseRawK2TaskData({
      rawTaskData: {
        ...partialRawTaskData,
        task_id: taskAccountPubKey,
      },
    });
  } catch (e) {
    return throwDetailedError({
      detailed: `Error during Task parsing${
        context ? ` in context of ${context}` : ''
      }: ${e}`,
      type: ErrorType.TASK_NOT_FOUND,
    });
  }
};

export const validateTask = getTaskInfo;
