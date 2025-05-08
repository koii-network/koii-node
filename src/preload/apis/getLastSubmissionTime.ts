import config from 'config';
import sendMessage from 'preload/sendMessage';

type GetTaskLastSubmissionTimeParams = {
  taskPublicKey: string;
  stakingPublicKey: string;
  averageSlotTime: number;
};

export default (payload: GetTaskLastSubmissionTimeParams): Promise<number> =>
  sendMessage(config.endpoints.GET_TASK_LAST_SUBMISSION_TIME, payload);
