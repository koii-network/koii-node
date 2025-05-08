import config from 'config';
import { WithdrawStakeParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: WithdrawStakeParam): Promise<string> =>
  sendMessage(config.endpoints.WITHDRAW_STAKE, payload);
