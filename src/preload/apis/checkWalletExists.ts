import config from 'config';
import { CheckWalletExistsResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (): Promise<CheckWalletExistsResponse> =>
  sendMessage(config.endpoints.CHECK_WALLET_EXISTS, {});
