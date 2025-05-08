import config from 'config';
import { DelegateStakeParam, DelegateStakeResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: DelegateStakeParam): Promise<DelegateStakeResponse> =>
  sendMessage(config.endpoints.DELEGATE_STAKE, payload);
