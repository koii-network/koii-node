import config from 'config';
import { GetStakingAccountPubKeyResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (): Promise<GetStakingAccountPubKeyResponse> =>
  sendMessage(config.endpoints.GET_STAKING_ACCOUNT_PUBKEY, {});
