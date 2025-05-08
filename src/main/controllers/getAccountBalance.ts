import { Event } from 'electron';

import { PublicKey } from '@_koii/web3.js';
import sdk from 'main/services/sdk';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

const balanceCache: Record<string, { balance: number; timestamp: number }> = {};
const CACHE_TIME = 5000;
const getAccountBalance = async (_: Event, pubkey: string): Promise<number> => {
  try {
    // Check if balance exists in cache and it's not expired
    if (
      balanceCache[pubkey] &&
      Date.now() - balanceCache[pubkey].timestamp < CACHE_TIME
    ) {
      // If balance exists in cache and not expired, return it from the cache
      return balanceCache[pubkey].balance;
    } else {
      // Otherwise, fetch balance and update cache
      const balance = await sdk.k2Connection.getBalance(
        new PublicKey(pubkey),
        'processed'
      );
      balanceCache[pubkey] = { balance, timestamp: Date.now() };
      return balance;
    }
  } catch (error) {
    console.error(error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.FETCH_ACCOUNT_BALANCE,
    });
  }
};

export default getAccountBalance;
