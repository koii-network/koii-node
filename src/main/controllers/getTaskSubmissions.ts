import { getTaskDataFromCache } from 'main/services/tasks-cache-utils';
import { GetRetryDataByTaskIdParam, SubmissionsPerRound } from 'models';

export const getTaskSubmissions = async (
  _: Event,
  { taskPubKey }: GetRetryDataByTaskIdParam
): Promise<SubmissionsPerRound> => {
  const submissions = await getTaskDataFromCache(taskPubKey, 'submissions');

  return submissions?.submissions || {};
};
