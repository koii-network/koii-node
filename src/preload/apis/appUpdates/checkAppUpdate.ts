import { UpdateCheckResult } from 'electron-updater';

import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (): Promise<UpdateCheckResult | null> =>
  sendMessage(config.endpoints.CHECK_APP_UPDATE, {});
