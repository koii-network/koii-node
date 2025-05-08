import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import {
  ErrorType,
  GetEncryptedSecretPhraseParam,
  GetEncryptedSecretPhraseResponse,
} from 'models';
import { throwDetailedError } from 'utils';

export const getEncryptedSecretPhrase = async (
  event: Event,
  publicKey: GetEncryptedSecretPhraseParam
): Promise<GetEncryptedSecretPhraseResponse> => {
  try {
    const allEncryptedSecretPhraseString: string | undefined =
      await namespaceInstance.storeGet(SystemDbKeys.EncryptedSecretPhraseMap);
    const allEncryptedSecretPhrase: Record<string, string> =
      allEncryptedSecretPhraseString
        ? (JSON.parse(allEncryptedSecretPhraseString) as Record<string, string>)
        : {};
    return allEncryptedSecretPhrase[publicKey];
  } catch (error: any) {
    console.error(error);
    return throwDetailedError({
      detailed: `Error retrieving saved seed phrases: ${error}`,
      type: ErrorType.GENERIC,
    });
  }
};
