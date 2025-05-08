import config from 'config';
import { GetMyTaskStakeParams } from 'main/controllers/tasks/getMyTaskStake';
import sendMessage from 'preload/sendMessage';

export default (payload: GetMyTaskStakeParams): Promise<number> =>
  sendMessage(config.endpoints.GET_MY_TASK_STAKE, payload);
