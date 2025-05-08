import { Event } from 'electron';

import { PublicKey } from '@_koii/web3.js';
import sdk from 'main/services/sdk';
import { ErrorType } from 'models';
import { KPLBalanceResponse } from 'models/api';
import { throwDetailedError } from 'utils';

// Cache for specific token balances
const specificBalanceCache: Record<
  string, // pubkey
  Record<
    string, // mintAddress
    { value: KPLBalanceResponse; timestamp: number }
  >
> = {};

const CACHE_TIME = 5000;

/**
 * Gets the balance of a specific KPL token for a wallet
 * @param _ Electron event
 * @param pubkey The wallet public key
 * @param mintAddress The mint address of the token to check (defaults to 9VUq3SfNDh1bgwamF8tr9aGvuXvNi6ktjx1Edc2da7ey)
 * @returns The token balance information or null if not found
 */
export const getSpecificKPLBalance = async (
  _: Event,
  pubkey: string,
  mintAddress: string
): Promise<KPLBalanceResponse | null> => {
  try {
    // Check if we have a cached value first
    const shouldRetrieveFromCache =
      specificBalanceCache[pubkey]?.[mintAddress] &&
      Date.now() - specificBalanceCache[pubkey][mintAddress].timestamp <
        CACHE_TIME;

    if (shouldRetrieveFromCache) {
      return specificBalanceCache[pubkey][mintAddress].value;
    }

    // If not in cache, fetch directly
    const publicKey = new PublicKey(pubkey);
    const mintPublicKey = new PublicKey(mintAddress);

    // Get the token account for this specific mint
    const tokenAccounts = await sdk.k2Connection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint: mintPublicKey }
    );

    if (!tokenAccounts?.value?.length) {
      // User doesn't have this token
      return null;
    }

    // Get the token data
    const accountInfo = tokenAccounts.value[0];
    const tokenAmount =
      accountInfo.account.data?.parsed.info.tokenAmount.amount;
    const associateTokenAddress = accountInfo.pubkey.toString();

    const tokenData: KPLBalanceResponse = {
      mint: mintAddress,
      balance: tokenAmount,
      associateTokenAddress,
    };

    // Update the cache with this token
    if (!specificBalanceCache[pubkey]) {
      specificBalanceCache[pubkey] = {};
    }

    specificBalanceCache[pubkey][mintAddress] = {
      value: tokenData,
      timestamp: Date.now(),
    };

    return tokenData;
  } catch (error) {
    console.error('Error fetching specific KPL balance:', error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.FETCH_ACCOUNT_BALANCE,
    });
  }
};
