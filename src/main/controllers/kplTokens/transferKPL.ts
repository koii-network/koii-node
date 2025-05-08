import { Event } from 'electron';
import fs from 'fs';

import {
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  PublicKey,
} from '@_koii/web3.js';
import {
  getMint,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey as SolanaPublicKey,
  // eslint-disable-next-line @cspell/spellchecker
  Keypair as SolanaKeypair,
} from '@solana/web3.js';
import sdk from 'main/services/sdk';
import { ErrorType, NetworkErrors, TransferKPLParam } from 'models';
import { throwDetailedError } from 'utils';

import { getMainSystemWalletPath } from '../../node/helpers';

export const transferKPL = async (
  event: Event,
  payload: TransferKPLParam
): Promise<void> => {
  console.log('Transferring KPL funds from Main wallet');
  const { accountName, mint, amount, toWalletAddress } = payload;
  const mainSystemAccountPath = await getMainSystemWalletPath(accountName);
  let senderAccount;
  if (!fs.existsSync(mainSystemAccountPath)) {
    return throwDetailedError({
      detailed: `No wallet found at location: ${mainSystemAccountPath}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  try {
    senderAccount = Keypair.fromSecretKey(
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
    const mintAccount = new PublicKey(mint);
    const mintInfo = await getMint(
      sdk.k2Connection as unknown as Connection,
      mintAccount as unknown as SolanaPublicKey
    );
    const digits = mintInfo.decimals;

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      sdk.k2Connection as unknown as Connection,
      senderAccount as unknown as SolanaKeypair,
      mintAccount as unknown as SolanaPublicKey,
      senderAccount.publicKey as unknown as SolanaPublicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      sdk.k2Connection as unknown as Connection,
      senderAccount as unknown as SolanaKeypair,
      mintAccount as unknown as SolanaPublicKey,
      new PublicKey(toWalletAddress) as unknown as SolanaPublicKey
    );

    const transferInstruction = createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      senderAccount.publicKey as unknown as SolanaPublicKey,
      amount * 10 ** digits,
      []
    );

    const transaction = new Transaction().add(transferInstruction);

    await sendAndConfirmTransaction(sdk.k2Connection, transaction, [
      senderAccount,
    ]);
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
