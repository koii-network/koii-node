import config from 'config';
import { TransferKoiiParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export const transferKoiiFromStakingWallet = async (
  payload: TransferKoiiParam
): Promise<void> =>
  sendMessage(config.endpoints.TRANSFER_KOII_FROM_STAKING_WALLET, payload);
