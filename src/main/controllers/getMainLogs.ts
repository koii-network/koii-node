import { shell } from 'electron';
import { join } from 'path';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

const FAILED_TO_OPEN = 'Failed to open path';
const FAILED_TO_GET_APP_DATA = 'Failed to get app data path';
const FILE_NOT_FOUND = 'file not found';

export const getLogFilePath = (getAppDataPath: any) => {
  try {
    return join(getAppDataPath(), 'logs', 'main.log');
  } catch (err) {
    throw new Error(FAILED_TO_GET_APP_DATA);
  }
};

export const getMainLogs = async (event: Event): Promise<boolean> => {
  try {
    const logfilePath = getLogFilePath(getAppDataPath);
    const result = await shell.openPath(logfilePath);

    if (result === FAILED_TO_OPEN) throw new Error(FILE_NOT_FOUND);
    return true;
  } catch (err: any) {
    console.error(err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};
