import { shell } from 'electron';
import { join } from 'path';

import { isString } from 'lodash';
import { getAppDataPath } from 'main/node/helpers/getAppDataPath';
import { OpenLogfileFolderParams } from 'models';

const FAILED_TO_OPEN = 'Failed to open path';

export const openLogfileFolder = async (
  event: Event,
  payload: OpenLogfileFolderParams
): Promise<boolean> => {
  try {
    const { taskAccountPublicKey } = payload;
    if (!isString(taskAccountPublicKey)) return false;

    const logfilePath = join(
      getAppDataPath(),
      'namespace',
      taskAccountPublicKey
    );
    const result = await shell.openPath(logfilePath);

    if (result === FAILED_TO_OPEN) return false;
    return true;
  } catch (e: any) {
    console.error(e);
    return false;
  }
};
