import { Event } from 'electron';

import { get } from 'lodash';
import { setMaxLogSize } from 'main/logger';

import { ErrorType } from '../../../models';
import { throwDetailedError } from '../../../utils';
import getUserConfig from '../getUserConfig';
import storeUserConfig from '../storeUserConfig';

export const limitLogsSize = async (): Promise<boolean> => {
  try {
    const userConfig = await getUserConfig();
    const limitLogsSize = get(userConfig, 'limitLogsSize', false);

    const operationResponse = await storeUserConfig({} as Event, {
      settings: { ...userConfig, limitLogsSize: !limitLogsSize },
    });

    if (limitLogsSize) {
      setMaxLogSize(5);
    } else {
      setMaxLogSize(null);
    }

    return operationResponse;
  } catch (err) {
    console.error('LIMIT LOGS SIZE', err);
    return throwDetailedError({
      detailed: err as string,
      type: ErrorType.GENERIC,
    });
  }
};
