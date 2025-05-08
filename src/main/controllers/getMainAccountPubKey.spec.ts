import { getMainSystemAccountKeypair } from '../node/helpers';

import getMainAccountPubKey from './getMainAccountPubKey';

jest.mock('../node/helpers', () => ({
  getMainSystemAccountKeypair: jest.fn(),
}));

describe('mainAccountPubKey', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the main account public key as a string', async () => {
    const publicKeyBase58 = 'example_public_key';

    (getMainSystemAccountKeypair as jest.Mock).mockResolvedValueOnce({
      publicKey: {
        toBase58: jest.fn().mockReturnValueOnce(publicKeyBase58),
      },
    });

    const result = await getMainAccountPubKey();

    expect(result).toBe(publicKeyBase58);
    expect(getMainSystemAccountKeypair).toHaveBeenCalled();
  });

  it('should throw an error when getMainSystemAccountKey-pair rejects', async () => {
    const errorMessage = 'something went wrong';

    (getMainSystemAccountKeypair as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(getMainAccountPubKey()).rejects.toThrow(errorMessage);
    expect(getMainSystemAccountKeypair).toHaveBeenCalled();
  });
});
