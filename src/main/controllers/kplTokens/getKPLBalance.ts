import { Event } from 'electron';

import { PublicKey } from '@_koii/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import sdk from 'main/services/sdk';
import { ErrorType } from 'models';
import { KPLBalanceResponse } from 'models/api';
import { throwDetailedError } from 'utils';

const balanceCache: Record<
  string,
  { value: KPLBalanceResponse[]; timestamp: number }
> = {};

const CACHE_TIME = 5000;

export const getKPLBalance = async (
  _: Event,
  pubkey: string
): Promise<KPLBalanceResponse[]> => {
  try {
    const shouldRetrieveFromCache =
      balanceCache[pubkey] &&
      Date.now() - balanceCache[pubkey].timestamp < CACHE_TIME;
    if (shouldRetrieveFromCache) {
      return balanceCache[pubkey].value;
    } else {
      const publicKey = new PublicKey(pubkey);
      const tokenAccounts =
        await sdk.k2Connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
      if (tokenAccounts === null || tokenAccounts?.value === null) {
        return throwDetailedError({
          detailed: 'Token Accounts not found',
          type: ErrorType.FETCH_ACCOUNT_BALANCE,
        });
      }
      const newValue: KPLBalanceResponse[] = [];
      tokenAccounts.value.forEach((accountInfo) => {
        const tokenAmount =
          accountInfo.account.data?.parsed.info.tokenAmount.amount;
        const mintAddress = accountInfo.account.data?.parsed.info.mint;
        const associateTokenAddress = accountInfo.pubkey;
        const publicKeyString = associateTokenAddress.toString();
        newValue.push({
          mint: mintAddress,
          balance: tokenAmount,
          associateTokenAddress: publicKeyString,
        });
      });
      balanceCache[pubkey] = { value: newValue, timestamp: Date.now() };
      return newValue;
    }
  } catch (error) {
    console.error(error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.FETCH_ACCOUNT_BALANCE,
    });
  }
};
