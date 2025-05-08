import fs from 'fs';

import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@_koii/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getMint,
} from '@solana/spl-token';
import {
  Connection as SolConnection,
  PublicKey as SolPublicKey,
  Signer as SolSigner,
} from '@solana/web3.js';
import {
  getMainSystemWalletPath,
  getStakingWalletPath,
} from 'main/node/helpers/wallets';
import sdk from 'main/services/sdk';
import { ErrorType } from 'models/error';
import { AccountType } from 'renderer/features/settings/types';
import { calculateTxFee, ROE_PER_KOII } from 'utils/calculateTxFee';
import { throwDetailedError } from 'utils/error';

export type TokenTransferParams = {
  accountName: string;
  toWallet: string;
  tokenMintAddress: string;
  amount: number;
  accountType: AccountType;
};

type TransactionSignatureString = string;

const TOKEN_PROGRAM_ID = new PublicKey(
  // eslint-disable-next-line @cspell/spellchecker
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

export async function transferToken({
  toWallet,
  tokenMintAddress,
  amount,
  accountName,
  accountType,
}: TokenTransferParams): Promise<TransactionSignatureString> {
  const connection = sdk.k2Connection;
  const mint = new PublicKey(tokenMintAddress);

  const toPublicKey = new PublicKey(toWallet);

  const mainSystemAccountPath =
    accountType === 'SYSTEM'
      ? getMainSystemWalletPath(accountName)
      : getStakingWalletPath(accountName);

  if (!fs.existsSync(mainSystemAccountPath)) {
    return throwDetailedError({
      detailed: `No wallet found at location: ${mainSystemAccountPath}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  let fromKeypair: SolSigner;

  try {
    fromKeypair = Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(
          fs.readFileSync(mainSystemAccountPath, 'utf-8')
        ) as Uint8Array
      )
    ) as unknown as SolSigner;
  } catch (e: any) {
    console.error(e);
    return throwDetailedError({
      detailed: `Error during retrieving wallet from ${mainSystemAccountPath}: ${e}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection as unknown as SolConnection,
    fromKeypair,
    mint as unknown as SolPublicKey,
    fromKeypair.publicKey as unknown as SolPublicKey
  );
  const mintAccount = new PublicKey(mint);
  const mintInfo = await getMint(
    sdk.k2Connection as unknown as SolConnection,
    mintAccount as unknown as SolPublicKey
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection as unknown as SolConnection,
    fromKeypair as unknown as SolSigner,
    mint as unknown as SolPublicKey,
    toPublicKey as unknown as SolPublicKey
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromKeypair.publicKey as unknown as SolPublicKey,
      amount, // * 10 ** mintInfo.decimals,
      []
      // TOKEN_PROGRAM_ID as unknown as SolPublicKey
    )
  );

  const estimatedFees = await calculateTxFee(connection, 1);

  const balance = await connection.getBalance(fromKeypair.publicKey);

  if (balance < estimatedFees) {
    return throwDetailedError({
      detailed: `Insufficient balance to cover transaction fees. Required: ${
        estimatedFees / ROE_PER_KOII
      } KOII, Available: ${balance / ROE_PER_KOII} KOII`,
      type: ErrorType.INSUFFICIENT_FUNDS,
    });
  }

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromKeypair,
    ]);
    return signature;
  } catch (error) {
    console.error('Transaction error:', error);
    if ((error as any).logs) {
      console.error('Transaction logs:', (error as any).logs);
    }
    return throwDetailedError({
      detailed: `Transaction failed: ${(error as any).message}`,
      type: ErrorType.KPL_TOKEN_TRANSFER_FAILED,
    });
  }
}
