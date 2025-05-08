import config from 'config';
import { GetRetryDataByTaskIdParam, SubmissionsPerRound } from 'models';
import sendMessage from 'preload/sendMessage';

export default (
  payload: GetRetryDataByTaskIdParam
): Promise<SubmissionsPerRound> =>
  sendMessage(config.endpoints.GET_TASK_SUBMISSIONS, payload);
