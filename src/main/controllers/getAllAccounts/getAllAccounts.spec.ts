import fs from 'fs';

import { getAllAccounts } from './getAllAccounts';

jest.mock('../../node/helpers', () => ({
  getCurrentActiveAccountName: jest
    .fn()
    .mockReturnValue(Promise.resolve('testAccount')),
}));

jest.mock('main/node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn(),
}));

jest.mock('fs', () => ({
  readdirSync: jest.fn().mockReturnValue([
    { name: 'testAccount_account.json', isFile: () => true },
    { name: 'secondAccount_account2.json', isFile: () => true },
    { name: 'test_account3.json', isFile: () => false },
    { name: 'test_account3.txt', isFile: () => true },
  ] as fs.Dirent[]),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(JSON.stringify({})),
}));

jest.mock('main/services/sdk', () => ({
  k2Connection: {
    getBalance: jest.fn().mockReturnValue(Promise.resolve(100)),
  },
}));

jest.mock('@_koii/web3.js', () => {
  const PublicKey = {
    toBase58: jest.fn().mockReturnValue('MockPublicKeyInBase58'),
  };

  return {
    Keypair: {
      fromSecretKey: jest.fn().mockReturnValue({ publicKey: PublicKey }),
    },
    PublicKey: jest.fn(() => PublicKey),
  };
});

describe.skip('getAllAccounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work correctly', async () => {
    const result = await getAllAccounts({} as Event, true);

    // Assert
    expect(result).toEqual([
      {
        accountName: 'testAccount',
        mainPublicKey: 'MockPublicKeyInBase58',
        stakingPublicKey: 'MockPublicKeyInBase58',
        isDefault: true,
        mainPublicKeyBalance: 100,
        stakingPublicKeyBalance: 100,
      },
      {
        accountName: 'secondAccount',
        mainPublicKey: 'MockPublicKeyInBase58',
        stakingPublicKey: 'MockPublicKeyInBase58',
        isDefault: false,
        mainPublicKeyBalance: 100,
        stakingPublicKeyBalance: 100,
      },
    ]);
  });
});
