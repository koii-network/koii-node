import config from 'config';
import { ClaimRewardParam, ClaimRewardResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  payload: ClaimRewardParam & { tokenType: string }
): Promise<ClaimRewardResponse> =>
  sendMessage(config.endpoints.CLAIM_REWARD_KPL, payload);
