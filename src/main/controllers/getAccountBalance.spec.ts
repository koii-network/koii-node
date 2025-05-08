import { Event } from 'electron';

import { PublicKey } from '@_koii/web3.js';
import sdk from 'main/services/sdk';

import getAccountBalance from './getAccountBalance';

jest.mock('main/services/sdk', () => ({
  k2Connection: {
    getBalance: jest.fn(),
  },
}));

describe('getAccountBalance', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error when an error occurs', async () => {
    const pubkey = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
    const errorMessage = '{"detailed":{},"type":"FETCH_ACCOUNT_BALANCE"}';

    (sdk.k2Connection.getBalance as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(getAccountBalance({} as Event, pubkey)).rejects.toThrow(
      errorMessage
    );
    expect(sdk.k2Connection.getBalance).toHaveBeenCalledWith(
      new PublicKey(pubkey),
      'processed'
    );
  });

  it('should return the account balance', async () => {
    const pubkey = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
    const expectedBalance = 1000;

    (sdk.k2Connection.getBalance as jest.Mock).mockResolvedValueOnce(
      expectedBalance
    );

    const result = await getAccountBalance({} as Event, pubkey);

    expect(result).toBe(expectedBalance);
    expect(sdk.k2Connection.getBalance).toHaveBeenCalledWith(
      new PublicKey(pubkey),
      'processed'
    );
  });
});
