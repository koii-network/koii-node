import { Event } from 'electron';
import fs from 'fs';

import {
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  PublicKey,
} from '@_koii/web3.js';
import sdk from 'main/services/sdk';
import { ErrorType, NetworkErrors, TransferKoiiParam } from 'models';
import { throwDetailedError } from 'utils';

import { getMainSystemWalletPath } from '../../node/helpers';

export const transferKoiiFromMainWallet = async (
  event: Event,
  payload: TransferKoiiParam
): Promise<void> => {
  console.log('Transferring funds from Main wallet');
  const { accountName, amount, toWalletAddress } = payload;

  const mainSystemAccountPath = getMainSystemWalletPath(accountName);
  let mainSystemAccount;
  if (!fs.existsSync(mainSystemAccountPath)) {
    return throwDetailedError({
      detailed: `No wallet found at location: ${mainSystemAccountPath}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  try {
    mainSystemAccount = Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(
          fs.readFileSync(mainSystemAccountPath, 'utf-8')
        ) as Uint8Array
      )
    );
  } catch (e: any) {
    console.error(e);
    return throwDetailedError({
      detailed: `Error during retrieving wallet from ${mainSystemAccountPath}: ${e}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  try {
    // Means account already exists
    const createSubmitterAccTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: mainSystemAccount.publicKey,
        toPubkey: new PublicKey(toWalletAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    await sendAndConfirmTransaction(
      sdk.k2Connection,
      createSubmitterAccTransaction,
      [mainSystemAccount]
    );
  } catch (e: any) {
    console.error(e);
    let errorType = ErrorType.GENERIC;
    if (e.message.toLowerCase().includes(NetworkErrors.TRANSACTION_TIMEOUT)) {
      errorType = ErrorType.TRANSACTION_TIMEOUT;
    } else if (e.message.toLowerCase().includes('invalid public key input')) {
      errorType = ErrorType.INVALID_WALLET_ADDRESS;
    }
    return throwDetailedError({
      detailed: e.message,
      type: errorType,
    });
  }
};
