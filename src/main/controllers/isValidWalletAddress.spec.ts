import { isValidWalletAddress } from './isValidWalletAddress';

describe('isValidWalletAddress', () => {
  it('should return true for a valid wallet address', () => {
    const validAddress = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
    const payload = { address: validAddress };

    const result = isValidWalletAddress({} as Event, payload);

    expect(result).toBeTruthy();
  });

  it('should return false for an invalid wallet address', () => {
    const invalidAddress = 'example_invalid_address';
    const payload = { address: invalidAddress };

    const result = isValidWalletAddress({} as Event, payload);

    expect(result).toBeFalsy();
  });
});
