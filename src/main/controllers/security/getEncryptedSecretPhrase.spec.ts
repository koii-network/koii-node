import { namespaceInstance } from 'main/node/helpers/Namespace';
import { throwDetailedError } from 'utils';

import { getEncryptedSecretPhrase } from './getEncryptedSecretPhrase';

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeGet: jest.fn(),
  },
}));
jest.mock('utils', () => ({
  throwDetailedError: jest.fn().mockImplementation((payload) => payload),
}));

describe('getEncryptedSecretPhrase', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the encrypted secret phrase for the provided public key', async () => {
    const publicKey = 'example_publicKey';
    const encryptedSecretPhraseMap = {
      [publicKey]: 'example_encrypted_phrase',
    };

    (namespaceInstance.storeGet as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(encryptedSecretPhraseMap)
    );

    const result = await getEncryptedSecretPhrase({} as Event, publicKey);

    expect(result).toBe(encryptedSecretPhraseMap[publicKey]);
    expect(namespaceInstance.storeGet).toHaveBeenCalled();
  });

  it('should return undefined when the encrypted secret phrase map is not found', async () => {
    const publicKey = 'example_publicKey';

    (namespaceInstance.storeGet as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await getEncryptedSecretPhrase({} as Event, publicKey);

    expect(result).toBeUndefined();
    expect(namespaceInstance.storeGet).toHaveBeenCalled();
  });

  it('should return a detailed error when an error occurs', async () => {
    const publicKey = 'example_publicKey';
    (namespaceInstance.storeGet as jest.Mock).mockRejectedValueOnce(
      new Error('something went wrong')
    );

    await getEncryptedSecretPhrase({} as Event, publicKey);

    expect(throwDetailedError).toHaveBeenCalled();
    expect(namespaceInstance.storeGet).toHaveBeenCalled();
  });
});
