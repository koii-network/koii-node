import config from 'config';
import {
  GetMyTaskSubmissionInfoParams,
  SubmissionInfoType,
} from 'main/controllers/tasks/getMyTaskSubmissionRoundInfo';
import sendMessage from 'preload/sendMessage';

export default (
  payload: GetMyTaskSubmissionInfoParams
): Promise<SubmissionInfoType | null> =>
  sendMessage(config.endpoints.GET_MY_TASK_SUBMISSION_INFO, payload);
