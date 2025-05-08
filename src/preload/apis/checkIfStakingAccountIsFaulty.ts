import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: {
  stakingPublicKey: string;
  isKPLStakingAccount: boolean;
}): Promise<boolean> =>
  sendMessage(config.endpoints.CHECK_IF_STAKING_ACCOUNT_IS_FAULTY, payload);
