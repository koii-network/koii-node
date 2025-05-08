/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-promise-executor-return */
/* eslint import/prefer-default-export: off */
import { BrowserWindow } from 'electron';
import path from 'path';
import { URL } from 'url';

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@_koii/web3.js';
import { getMint } from '@solana/spl-token';
import bs58 from 'bs58';
import { getMainSystemAccountKeypair } from 'main/node/helpers';
// eslint-disable-next-line @cspell/spellchecker
import nacl from 'tweetnacl';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const isDevMode = () => {
  return process.env.NODE_ENV === 'development';
};

export const sleep = (timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

export async function retryWithMaxCount(
  func: any,
  args: any,
  MAX_RETRY_COUNT = 3
) {
  let retryCount = 0;
  while (retryCount < MAX_RETRY_COUNT) {
    try {
      const response = await func(...args);
      return response;
    } catch (error) {
      console.error(`Function call failed: ${error}`);
      retryCount += 1;
      if (retryCount === MAX_RETRY_COUNT) {
        throw error;
      }
    }
  }
  console.error(
    `Reached maximum retry count (${MAX_RETRY_COUNT}) for function call`
  );
}

export const setLocalStorage = (key: string, value: string) => {
  const appWindow = BrowserWindow.getAllWindows()?.[0];
  appWindow?.webContents
    .executeJavaScript(`localStorage.setItem('${key}', '${value}');`)
    .then(() => {
      console.log(`${key} updated in local storage`);
    });
};

export async function getKPLDigits(
  mintAddress: string,
  connection: Connection
) {
  const mint = new PublicKey(mintAddress);
  const mintInfo = await getMint(connection as any, mint as any);
  const { decimals } = mintInfo;
  return decimals;
}

export async function signMessageWithSystemWallet(data: string) {
  const mainSystemAccountKeypair = await getMainSystemAccountKeypair();
  return signPayload(data, mainSystemAccountKeypair);
}

const signPayload = (payload: string, keypair: Keypair) => {
  const msg = new TextEncoder().encode(JSON.stringify(payload));
  const signedMessage = nacl.sign(msg, keypair.secretKey);
  const signData = bs58.encode(
    Buffer.from(
      signedMessage.buffer,
      signedMessage.byteOffset,
      signedMessage.byteLength
    )
  );
  return signData;
};

export async function sendAndDoubleConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  signerList: Keypair[],
  confirmationRetryNumber = 4
) {
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signerList
    );
    return { status: 'Success', signature, error: null };
  } catch (error: any) {
    const isUnconfirmed = error.message.includes(
      'Transaction was not confirmed'
    );
    if (!isUnconfirmed) throw error;
    // Try to extract the signature from the error object
    const signatureMatch = error.message.match(/signature (\w+)/);
    const signature = signatureMatch
      ? signatureMatch[1]
      : 'Signature not found';
    console.log(
      'The transaction with signature ',
      signature,
      "couldn't be confirmed, will attempt to confirm it"
    );

    if (signature === 'Signature not found') {
      throw new Error(`Signature not found ${error}`);
    }
    let waitTime = 500;
    try {
      for (let i = 0; i < confirmationRetryNumber; i++) {
        const result = await connection.getSignatureStatus(signature);
        console.log(
          'Confirmation status:',
          result?.value,
          '- attempt',
          i + 1,
          'of',
          confirmationRetryNumber
        );
        if (result?.value?.err != null) {
          throw new Error(`Transaction failed: ${result.value.err}`);
        }
        if (
          result?.value?.confirmationStatus === 'finalized' ||
          result?.value?.confirmationStatus === 'confirmed'
        ) {
          return { status: 'Success', signature, error: null };
        }
        if (result?.value?.confirmationStatus === 'processed') {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          waitTime *= 1.5;
          continue;
        }
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        waitTime *= 1.5;
      }

      throw new Error(`Transaction status is unknown ${error}`);
    } catch (statusError) {
      throw new Error(`Transaction status is unknown ${statusError}`);
    }
  }
}
