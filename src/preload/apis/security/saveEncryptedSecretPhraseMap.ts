import config from 'config';
import { GetEncryptedSecretPhraseMapResponse } from 'models';

import sendMessage from '../../sendMessage';

export const saveEncryptedSecretPhraseMap = (
  payload: Record<string, string>
): Promise<GetEncryptedSecretPhraseMapResponse> =>
  sendMessage(config.endpoints.SAVE_ENCRYPTED_SECRET_PHRASE_MAP, payload);
