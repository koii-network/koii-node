import { getStakingAccountKeypair } from '../node/helpers';

import getStakingAccountPubKey from './getStakingAccountPubKey';

jest.mock('../node/helpers', () => ({
  getStakingAccountKeypair: jest.fn(),
}));

describe('stakingAccountPubKey', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the staking account public key as a string', async () => {
    const publicKeyBase58 = 'example_public_key';

    (getStakingAccountKeypair as jest.Mock).mockResolvedValueOnce({
      publicKey: {
        toBase58: jest.fn().mockReturnValueOnce(publicKeyBase58),
      },
    });

    const result = await getStakingAccountPubKey();

    expect(result).toEqual(publicKeyBase58);
    expect(getStakingAccountKeypair).toHaveBeenCalled();
  });

  it('should throw an error when getStakingAccountKey-pair rejects', async () => {
    const errorMessage = 'something went wrong';

    (getStakingAccountKeypair as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(getStakingAccountPubKey()).rejects.toThrow(errorMessage);
    expect(getStakingAccountKeypair).toHaveBeenCalled();
  });
});
