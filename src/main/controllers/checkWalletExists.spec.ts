import {
  getMainSystemAccountKeypair,
  getStakingAccountKeypair,
} from '../node/helpers';

import checkWalletExists from './checkWalletExists';

jest.mock('../node/helpers', () => ({
  getMainSystemAccountKeypair: jest.fn(),
  getStakingAccountKeypair: jest.fn(),
}));

describe('checkWallet', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return true for mainSystemAccount when getMainSystemAccountKey-pair resolves', async () => {
    (getMainSystemAccountKeypair as jest.Mock).mockResolvedValueOnce(
      () => 'example_key_pair'
    );
    const result = await checkWalletExists();

    expect(getMainSystemAccountKeypair).toHaveBeenCalled();
    expect(result.mainSystemAccount).toBe(true);
  });

  it('should return false for mainSystemAccount when getMainSystemAccountKey-pair rejects', async () => {
    (getMainSystemAccountKeypair as jest.Mock).mockRejectedValueOnce(
      () => null
    );

    const result = await checkWalletExists();

    expect(getMainSystemAccountKeypair).toHaveBeenCalled();
    expect(result.mainSystemAccount).toBe(false);
  });

  it('should return true for stakingWallet when getStakingAccountKey-pair resolves', async () => {
    (getStakingAccountKeypair as jest.Mock).mockResolvedValueOnce(
      () => 'example_key-pair'
    );

    const result = await checkWalletExists();

    expect(getStakingAccountKeypair).toHaveBeenCalled();
    expect(result.stakingWallet).toBe(true);
  });

  it('should return false for stakingWallet when getStakingAccountKey-pair rejects', async () => {
    (getStakingAccountKeypair as jest.Mock).mockRejectedValueOnce(() => false);

    const result = await checkWalletExists();

    expect(getStakingAccountKeypair).toHaveBeenCalled();
    expect(result.stakingWallet).toBe(false);
  });
});
