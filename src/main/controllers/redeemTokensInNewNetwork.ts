import https from 'https';

import { Keypair } from '@_koii/web3.js';
import bs58 from 'bs58';
import {
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from 'main/node/helpers';
// eslint-disable-next-line @cspell/spellchecker
import nacl from 'tweetnacl';
import { getKoiiFromRoe } from 'utils';

import getActiveAccountName from './getActiveAccountName';
import { getAllAccounts } from './getAllAccounts';
import { setActiveAccount } from './setActiveAccount';

export const redeemTokensInNewNetwork = async (): Promise<number> => {
  const activeAccount = await getActiveAccountName();
  const setBackActiveAccount = async () => {
    await setActiveAccount({} as Event, { accountName: activeAccount });
    console.log(
      `REDEEM PENDING TOKENS: set previously selected account '${activeAccount}' as active account`
    );
  };
  const allAccounts = await getAllAccounts({} as Event, false);
  let tokensRedeemed = 0;

  try {
    for (const account of allAccounts) {
      console.log(
        `REDEEM PENDING TOKENS: setting account ${account.accountName} as active account`
      );
      await setActiveAccount({} as Event, { accountName: account.accountName });
      const redemptionResult = await redeemTokensForActiveAccount();
      if (redemptionResult?.totalBalance) {
        tokensRedeemed += redemptionResult.totalBalance || 0;
      }
      console.log(
        `REDEEM PENDING TOKENS: redeeming for account with main public key ${account.mainPublicKey} and staking key ${account.stakingPublicKey} gave the following result:`,
        redemptionResult
      );
    }

    const tokensRedeemedInKoii = getKoiiFromRoe(tokensRedeemed);
    return tokensRedeemedInKoii;
  } finally {
    await setBackActiveAccount();
  }
};

const redeemTokensForActiveAccount = async () => {
  const mainSystemAccountKeypair = await getMainSystemAccountKeypair();
  const stakingSystemAccountKeypair = await getStakingAccountKeypair();

  const postData = async (
    publicKey: string,
    signedMessage: string
  ): Promise<{
    totalBalance: number;
  }> => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        publicKey,
        signedMessage,
      });

      const options = {
        hostname: 'faucet.api.koii.network',
        path: '/api/claimStakedAmounts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            resolve(
              JSON.parse(responseData) as {
                totalBalance: number;
              }
            );
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (error) => {
        reject(error.message);
      });

      req.write(data);
      req.end();
    });
  };

  const stakingAccountSignature = await signPayload(
    mainSystemAccountKeypair.publicKey.toBase58(),
    stakingSystemAccountKeypair
  );

  const response = await postData(
    stakingSystemAccountKeypair.publicKey.toBase58(),
    stakingAccountSignature
  );

  return response;
};

const signPayload = async (payload: string, keypair: Keypair) => {
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
