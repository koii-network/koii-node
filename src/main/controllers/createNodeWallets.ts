import { Event } from 'electron';
import fs from 'fs';

import { K2Tool } from '@_koii/sdk/k2';
import { Keypair } from '@_koii/web3.js';
import * as bip39 from 'bip39';
import { validateMnemonic } from 'bip39';
import {
  KPL_STAKING_DERIVATION_PATH,
  STAKING_DERIVATION_PATH,
} from 'config/node';
import { SystemDbKeys } from 'config/systemDbKeys';
import { derivePath } from 'ed25519-hd-key';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType } from 'models';
import { CreateNodeWalletsParam, CreateNodeWalletsResponse } from 'models/api';
import { throwDetailedError } from 'utils';

import { getAppDataPath } from '../node/helpers/getAppDataPath';

const createNodeWallets = async (
  event: Event,
  payload: CreateNodeWalletsParam
): Promise<CreateNodeWalletsResponse> => {
  const { mnemonic, accountName, encryptedSecretPhrase } = payload;
  if (!mnemonic) {
    return throwDetailedError({
      detailed: 'Please provide a mnemonic to generate wallets',
      type: ErrorType.NO_MNEMONIC,
    });
  }

  if (!validateMnemonic(mnemonic)) {
    return throwDetailedError({
      detailed: 'Please provide a valid mnemonic to generate wallets',
      type: ErrorType.NO_VALID_MNEMONIC,
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

  if (!/^[0-9a-zA-Z ... ]+$/.test(accountName)) {
    return throwDetailedError({
      detailed: `Please provide a valid account name, got "${accountName}"`,
      type: ErrorType.NO_VALID_ACCOUNT_NAME,
    });
  }
  try {
    // Creating stakingWallet
    const stakingWalletFilePath = `${getAppDataPath()}/namespace/${accountName}_stakingWallet.json`;
    if (fs.existsSync(stakingWalletFilePath)) {
      return throwDetailedError({
        detailed: `Staking wallet with same account name "${accountName}" already exists`,
        type: ErrorType.NO_VALID_ACCOUNT_NAME,
      });
    }
    const stakingSeed = bip39.mnemonicToSeedSync(mnemonic, '');
    const stakingWalletPath = STAKING_DERIVATION_PATH;
    const stakingWallet = Keypair.fromSeed(
      derivePath(stakingWalletPath, stakingSeed.toString('hex')).key
    );

    // Creating KPL staking wallet
    const kplStakingWalletFilePath = `${getAppDataPath()}/namespace/${accountName}_kplStakingWallet.json`;
    if (fs.existsSync(kplStakingWalletFilePath)) {
      return throwDetailedError({
        detailed: `KPL staking wallet with same account name "${accountName}" already exists`,
        type: ErrorType.NO_VALID_ACCOUNT_NAME,
      });
    }

    const kplStakingWalletPath = KPL_STAKING_DERIVATION_PATH;
    const kplStakingWallet = Keypair.fromSeed(
      derivePath(kplStakingWalletPath, stakingSeed.toString('hex')).key
    );

    console.log({
      kplStakingWalletPubKey: kplStakingWallet.publicKey.toBase58(),
    });

    // Creating MainAccount
    const mainWalletFilePath = `${getAppDataPath()}/wallets/${accountName}_mainSystemWallet.json`;
    const k2Tool = new K2Tool();
    if (fs.existsSync(mainWalletFilePath)) {
      return throwDetailedError({
        detailed: `Main wallet with same account name "${accountName}" already exists`,
        type: ErrorType.NO_VALID_ACCOUNT_NAME,
      });
    }

    await k2Tool.importWallet(mnemonic, 'seedphrase');
    const mainWallet = k2Tool.keypair;

    if (!mainWallet?.secretKey)
      return throwDetailedError({
        detailed: 'Wallet import failed',
        type: ErrorType.GENERIC,
      });

    const stakingWalletFileContent = JSON.stringify(
      Array.from(stakingWallet.secretKey)
    );
    const kplStakingWalletFileContent = JSON.stringify(
      Array.from(kplStakingWallet.secretKey)
    );
    const mainWalletFileContent = JSON.stringify(
      Array.from(mainWallet.secretKey)
    );
    const existingWalletFiles = fs.readdirSync(`${getAppDataPath()}/wallets`);
    const walletAlreadyExists = existingWalletFiles.some((file) => {
      const fileContent = fs.readFileSync(
        `${getAppDataPath()}/wallets/${file}`
      );
      return fileContent.equals(Buffer.from(mainWalletFileContent));
    });
    // Verify a wallet created from the same mnemonic doesn't exist
    if (walletAlreadyExists) {
      return throwDetailedError({
        detailed: 'A wallet with the same mnemonic already exists',
        type: ErrorType.DUPLICATE_ACCOUNT,
      });
    }

    console.log(
      'Generating Staking wallet from mnemonic',
      stakingWallet.publicKey.toBase58()
    );
    console.log(
      'Generating KPL Staking wallet from mnemonic',
      kplStakingWallet.publicKey.toBase58()
    );
    console.log(
      'Generating Main wallet from mnemonic',
      mainWallet.publicKey.toBase58()
    );
    fs.writeFile(stakingWalletFilePath, stakingWalletFileContent, (err) => {
      if (err) {
        console.error(err);
        throwDetailedError({
          detailed: err.message,
          type: ErrorType.GENERIC,
        });
      }
    });
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
    fs.writeFile(mainWalletFilePath, mainWalletFileContent, (err) => {
      if (err) {
        console.error(err);
        throwDetailedError({
          detailed: err.message,
          type: ErrorType.GENERIC,
        });
      }
    });

    // add seed phrase to db
    const allEncryptedSecretPhraseString: string | undefined =
      await namespaceInstance.storeGet(SystemDbKeys.EncryptedSecretPhraseMap);

    try {
      const allEncryptedSecretPhrase: Record<string, string> =
        allEncryptedSecretPhraseString
          ? (JSON.parse(allEncryptedSecretPhraseString) as Record<
              string,
              string
            >)
          : {};

      const publicKey = mainWallet.publicKey.toBase58();

      allEncryptedSecretPhrase[publicKey] = encryptedSecretPhrase;

      const stringifiedAllEncryptedSecretPhrase = JSON.stringify(
        allEncryptedSecretPhrase
      );
      await namespaceInstance.storeSet(
        SystemDbKeys.EncryptedSecretPhraseMap,
        stringifiedAllEncryptedSecretPhrase
      );
    } catch (error: any) {
      console.error(error);
      return throwDetailedError({
        detailed: `Error during saving seed phrase: ${error}`,
        type: ErrorType.GENERIC,
      });
    }

    return {
      stakingWalletPubKey: stakingWallet.publicKey.toBase58(),
      kplStakingWalletPubKey: kplStakingWallet.publicKey.toBase58(),
      mainAccountPubKey: mainWallet.publicKey.toBase58(),
    };
  } catch (err: any) {
    console.log('ERROR during Account creation', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};

export default createNodeWallets;
