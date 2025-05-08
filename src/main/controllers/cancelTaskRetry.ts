import { SystemDbKeys } from 'config/systemDbKeys';
import { get } from 'lodash';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { CancelTaskRetryParam } from 'models';

export const cancelTaskRetry = async (
  _: Event,
  payload: CancelTaskRetryParam
): Promise<void> => {
  const { taskPubKey } = payload;

  const allTaskRetryData =
    (await namespaceInstance.storeGet(SystemDbKeys.TaskRetryData)) || {};

  const taskRetryData = get(allTaskRetryData, taskPubKey, null);

  if (taskRetryData) {
    taskRetryData.cancelled = true;

    namespaceInstance.storeSet(SystemDbKeys.TaskRetryData, {
      ...allTaskRetryData,
      [taskPubKey]: taskRetryData,
    });
  }
};
