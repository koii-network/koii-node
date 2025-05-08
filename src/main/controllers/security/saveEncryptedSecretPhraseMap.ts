import { Event } from 'electron';

import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

export const saveEncryptedSecretPhraseMap = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: Event,
  payload: Record<string, string>
) => {
  try {
    const JSONString = JSON.stringify(payload);
    const res = await namespaceInstance.storeSet(
      SystemDbKeys.EncryptedSecretPhraseMap,
      JSONString
    );
    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return throwDetailedError({
      detailed: `Error saving seed phrases: ${error}`,
      type: ErrorType.GENERIC,
    });
  }
};
