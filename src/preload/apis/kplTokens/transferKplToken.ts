import config from 'config';
import { TokenTransferParams } from 'main/controllers/kplTokens/helpers/transferTokens';
import sendMessage from 'preload/sendMessage';

export const transferKplToken = async (
  payload: TokenTransferParams
): Promise<void> => {
  return sendMessage(config.endpoints.TRANSFER_KPL, payload);
};
