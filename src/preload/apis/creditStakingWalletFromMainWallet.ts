import config from 'config';
import { CreditStakingWalletFromMainWalletPayloadType } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  payload: CreditStakingWalletFromMainWalletPayloadType
): Promise<string> =>
  sendMessage(config.endpoints.CREDIT_STAKING_WALLET_FROM_MAIN_WALLET, payload);
