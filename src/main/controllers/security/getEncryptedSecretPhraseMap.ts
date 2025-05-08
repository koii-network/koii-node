import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType, GetEncryptedSecretPhraseMapResponse } from 'models';
import { throwDetailedError } from 'utils';

export const getEncryptedSecretPhraseMap = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: Event
): Promise<GetEncryptedSecretPhraseMapResponse> => {
  try {
    const allEncryptedSecretPhraseString: string | undefined =
      await namespaceInstance.storeGet(SystemDbKeys.EncryptedSecretPhraseMap);
    const allEncryptedSecretPhrase: Record<string, string> =
      allEncryptedSecretPhraseString
        ? (JSON.parse(allEncryptedSecretPhraseString) as Record<string, string>)
        : {};
    return allEncryptedSecretPhrase;
  } catch (error: any) {
    console.error(error);
    return throwDetailedError({
      detailed: `Error retrieving saved seed phrases: ${error}`,
      type: ErrorType.GENERIC,
    });
  }
};
