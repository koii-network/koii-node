import config from 'config';
import { OpenLogfileFolderParams } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: OpenLogfileFolderParams): Promise<boolean> =>
  sendMessage(config.endpoints.OPEN_LOGFILE_FOLDER, payload);
