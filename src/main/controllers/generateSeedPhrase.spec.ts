import { Event } from 'electron';

import { generateMnemonic } from 'bip39';

import generateSeedPhrase from './generateSeedPhrase';

jest.mock('bip39', () => ({
  generateMnemonic: jest.fn().mockImplementation(() => {
    return 'struggle noble ocean glance december wreck problem cereal spoil menu way onion';
  }),
  validateMnemonic: jest.fn().mockImplementation(() => {
    return true;
  }),
}));

describe('generateSeedPhrase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the generated seed phrase', async () => {
    const expectedSeedPhrase =
      'struggle noble ocean glance december wreck problem cereal spoil menu way onion';

    (generateMnemonic as jest.Mock).mockReturnValueOnce(expectedSeedPhrase);

    const result = await generateSeedPhrase({} as Event);

    expect(result).toEqual(expectedSeedPhrase);
    expect(generateMnemonic).toHaveBeenCalled();
  });
});
