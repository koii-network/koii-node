import config from 'config';
import { TransferKoiiParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export const transferKoiiFromMainWallet = async (
  payload: TransferKoiiParam
): Promise<void> => {
  return sendMessage(config.endpoints.TRANSFER_KOII_FROM_MAIN_WALLET, payload);
};
