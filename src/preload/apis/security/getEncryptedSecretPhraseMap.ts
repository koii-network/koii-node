import config from 'config';
import { GetEncryptedSecretPhraseMapResponse } from 'models';

import sendMessage from '../../sendMessage';

export const getEncryptedSecretPhraseMap =
  (): Promise<GetEncryptedSecretPhraseMapResponse> =>
    sendMessage(config.endpoints.GET_ENCRYPTED_SECRET_PHRASE_MAP, {});
