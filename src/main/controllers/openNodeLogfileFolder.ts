import { shell } from 'electron';
import { join } from 'path';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

const FAILED_TO_OPEN = 'Failed to open path';

export const openNodeLogfileFolder = async (): Promise<boolean> => {
  try {
    const logfilePath = join(getAppDataPath(), 'logs');
    const result = await shell.openPath(logfilePath);

    if (result === FAILED_TO_OPEN) return false;
    return true;
  } catch (e: any) {
    console.error(e);
    return false;
  }
};
