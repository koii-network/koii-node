import config from 'config';
import { GetAllTimeRewardsParam, ROE } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: GetAllTimeRewardsParam): Promise<ROE> =>
  sendMessage(config.endpoints.GET_ALL_TIME_REWARDS_BY_TASK, payload);
