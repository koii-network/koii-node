import config from 'config';
import { StoreAllTimeRewardsParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: StoreAllTimeRewardsParam): Promise<boolean> =>
  sendMessage(config.endpoints.STORE_ALL_TIME_REWARDS, payload);
