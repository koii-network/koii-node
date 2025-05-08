import { SystemDbKeys } from 'config/systemDbKeys';
import { get } from 'lodash';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { GetRetryDataByTaskIdParam, TaskRetryData } from 'models';

export const getRetryDataByTaskId = async (
  _: Event,
  payload: GetRetryDataByTaskIdParam
): Promise<TaskRetryData | null> => {
  const { taskPubKey } = payload;
  const allTaskRetryData: {
    [key: string]: TaskRetryData;
  } = (await namespaceInstance.storeGet(SystemDbKeys.TaskRetryData)) || {};

  const taskRetryData = get(allTaskRetryData, taskPubKey, null);

  return taskRetryData;
};
