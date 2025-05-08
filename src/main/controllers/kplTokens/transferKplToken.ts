import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

import { TokenTransferParams, transferToken } from './helpers/transferTokens';

export const transferKplToken = async (
  _event: Event,
  payload: TokenTransferParams
) => {
  try {
    const singnature = await transferToken(payload);

    console.log(
      `Transferred ${payload.amount} of token to ${payload.toWallet} with signature: ${singnature}`
    );
    return singnature;
  } catch (e) {
    console.error(e);
    return throwDetailedError({
      detailed: `Error when transferring token: ${e}`,
      type: ErrorType.TOKEN_TRANSFER_FAILED,
    });
  }
};
