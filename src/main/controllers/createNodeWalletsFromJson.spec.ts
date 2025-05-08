import { Event } from 'electron';
import fs from 'fs';

import { Keypair } from '@_koii/web3.js';
import * as bip39 from 'bip39';
import { STAKING_DERIVATION_PATH } from 'config/node';
import { derivePath } from 'ed25519-hd-key';

import createNodeWalletsFromJson from './createNodeWalletsFromJson';

const getWalletFromSeedphrase = (seedphrase: string) => {
  const stakingSeed = bip39.mnemonicToSeedSync(seedphrase, '');
  const stakingWalletPath = STAKING_DERIVATION_PATH;
  const wallet = Keypair.fromSeed(
    derivePath(stakingWalletPath, stakingSeed.toString('hex')).key
  );

  return wallet;
};

jest.spyOn(Keypair, 'fromSeed');
jest.spyOn(bip39, 'mnemonicToSeedSync');
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue({
    some: jest.fn(),
  }),
  writeFile: jest.fn(),
}));
jest.mock('utils', () => ({
  throwDetailedError: jest.fn().mockImplementation((payload) => payload),
}));
jest.mock('../node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn().mockReturnValue('/path/to/appdata'),
}));
jest.mock('@_koii/sdk/k2', () => ({
  K2Tool: class K2ToolMock {
    public keypair: any;

    private testWallet: any;

    constructor() {
      this.testWallet = getWalletFromSeedphrase(
        'struggle noble ocean glance december wreck problem cereal spoil menu way onion'
      );
    }

    importWallet(mnemonic: string, type: string) {
      this.keypair = this.testWallet;
      return this.testWallet;
    }
  },
}));
jest.mock('ed25519-hd-key', () => ({
  derivePath: jest.fn().mockReturnValue({
    key: Uint8Array.from(
      Buffer.from('DedFVZVtUH/juF0K1UIdgkYhRdzMvuVkYg4NizbZpjI=', 'base64')
    ),
  }),
}));

describe('createNodeWallets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalid payload', () => {
    it('returns detailed error', async () => {
      let payload = {};
      let result = await createNodeWalletsFromJson({} as Event, payload as any);
      expect(result).toEqual({
        detailed: 'Please provide a json key file to generate wallets',
        type: 'NO_JSON_KEY',
      });

      payload = {
        jsonKey: ['example', 'jsonKey'],
      };
      result = await createNodeWalletsFromJson({} as Event, payload as any);
      expect(result).toEqual({
        detailed: 'Please provide an account name to generate wallets',
        type: 'NO_VALID_ACCOUNT_NAME',
      });
    });
  });

  describe('valid payload', () => {
    it('create new dir if /namespace and /wallets are not existed', async () => {
      const payload = {
        jsonKey: ['example', 'jsonKey'],
        accountName: 'example_account_name',
      };
      fs.existsSync = jest.fn(() => false);
      await createNodeWalletsFromJson({} as Event, payload);

      expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    });

    it('does not create new dir if /namespace and /wallets are existed', async () => {
      const payload = {
        jsonKey: ['example', 'jsonKey'],
        accountName: 'example_account_name',
      };
      fs.existsSync = jest.fn(() => true);
      await createNodeWalletsFromJson({} as Event, payload);

      expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
    });

    it('return detailed error if accountName is invalid', async () => {
      const payload = {
        jsonKey: ['example', 'jsonKey'],
        accountName: 'example_account_name',
      };

      const result = await createNodeWalletsFromJson({} as Event, payload);

      expect(result).toEqual({
        detailed:
          'Please provide a valid account name, got "example_account_name"',
        type: 'NO_VALID_ACCOUNT_NAME',
      });
    });

    describe('create staking wallet', () => {
      it('return detailed error if staking wallet already exists', async () => {
        const payload = {
          jsonKey: ['example', 'jsonKey'],
          accountName: 'User12345678',
        };

        fs.existsSync = jest.fn(() => true);

        const result = await createNodeWalletsFromJson({} as Event, payload);

        expect(result).toEqual({
          detailed:
            'Wallet with same account name "User12345678" already exists',
          type: 'ACCOUNT_NAME_EXISTS',
        });
      });

      it('create staking wallet if staking wallet has not existed', async () => {
        const payload = {
          jsonKey: ['example', 'jsonKey'],
          accountName: 'User12345678',
        };

        fs.existsSync = jest.fn(() => false);
        Keypair.fromSecretKey = jest.fn(() =>
          getWalletFromSeedphrase(
            'return detailed error if staking wallet already exists'
          )
        );
        const result = await createNodeWalletsFromJson({} as Event, payload);

        expect(bip39.mnemonicToSeedSync).toHaveBeenCalledWith(
          'example jsonKey',
          ''
        );
        expect(Keypair.fromSeed).toHaveBeenCalled();
        expect(Keypair.fromSecretKey).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
          mainAccountPubKey: 'CDH9MAF1YxiiunHuNzHxWpBK37jurjLYeW9bjyqNYLXM',
          stakingWalletPubKey: 'CDH9MAF1YxiiunHuNzHxWpBK37jurjLYeW9bjyqNYLXM',
        });
      });
    });
  });
});
