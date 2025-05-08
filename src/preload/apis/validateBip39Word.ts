import config from 'config';
import { ValidateBip39WordParams } from 'models/api/validateBip39Word';
import sendMessage from 'preload/sendMessage';

export default (payload: ValidateBip39WordParams): Promise<boolean> =>
  sendMessage(config.endpoints.VALIDATE_BIP39_WORD, payload);
