import { Event } from 'electron';

import { K2Tool } from '@_koii/sdk/k2';

import { getAllAccounts } from '../getAllAccounts';

export const resetPin = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: Event,
  payload: { seedPhraseString: string }
) => {
  const allAcounts = await getAllAccounts(_, false);

  const k2Tool = new K2Tool();
  await k2Tool.importWallet(payload.seedPhraseString, 'seedphrase');
  const mainWallet = k2Tool.keypair;
  if (mainWallet?.secretKey) {
    const accountExists = allAcounts.find((account) => {
      return account.mainPublicKey === mainWallet.publicKey.toBase58();
    });

    if (accountExists) {
      return true;
    }

    return false;
  }
};
