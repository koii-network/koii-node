import fs from 'fs';

import { Keypair } from '@_koii/web3.js';
import * as bip39 from 'bip39';
import { KPL_STAKING_DERIVATION_PATH } from 'config/node';
import { derivePath } from 'ed25519-hd-key';
import { getAppDataPath } from 'main/node/helpers/getAppDataPath';
import { CreateNodeWalletsParam, ErrorType } from 'models';
import { throwDetailedError } from 'utils';

export const createMissingKPLStakingKey = (
  _: Event,
  payload: CreateNodeWalletsParam
) => {
  const { mnemonic, accountName } = payload;
  if (!mnemonic) {
    return throwDetailedError({
      detailed: 'Please provide a mnemonic to generate wallets',
      type: ErrorType.NO_MNEMONIC,
    });
  }

  if (!accountName) {
    return throwDetailedError({
      detailed: 'Please provide an account name to generate wallets',
      type: ErrorType.NO_VALID_ACCOUNT_NAME,
    });
  }
  if (!fs.existsSync(`${getAppDataPath()}/namespace`))
    fs.mkdirSync(`${getAppDataPath()}/namespace`);
  if (!fs.existsSync(`${getAppDataPath()}/wallets`))
    fs.mkdirSync(`${getAppDataPath()}/wallets`);

  try {
    const stakingSeed = bip39.mnemonicToSeedSync(mnemonic, '');
    const kplStakingWalletFilePath = `${getAppDataPath()}/namespace/${accountName}_kplStakingWallet.json`;

    if (fs.existsSync(kplStakingWalletFilePath)) {
      return throwDetailedError({
        detailed: `KPL staking key with same account name "${accountName}" already exists`,
        type: ErrorType.NO_VALID_ACCOUNT_NAME,
      });
    }

    const kplStakingWallet = Keypair.fromSeed(
      derivePath(KPL_STAKING_DERIVATION_PATH, stakingSeed.toString('hex')).key
    );
    const kplStakingWalletFileContent = JSON.stringify(
      Array.from(kplStakingWallet.secretKey)
    );

    fs.writeFile(
      kplStakingWalletFilePath,
      kplStakingWalletFileContent,
      (err) => {
        if (err) {
          console.error(err);
          throwDetailedError({
            detailed: err.message,
            type: ErrorType.GENERIC,
          });
        }
      }
    );

    console.log({
      kplStakingWalletPubKey: kplStakingWallet.publicKey.toBase58(),
    });
  } catch (error: any) {
    console.log('ERROR during KPL staking key creation', error);
    return throwDetailedError({
      detailed: error,
      type: ErrorType.GENERIC,
    });
  }
};
