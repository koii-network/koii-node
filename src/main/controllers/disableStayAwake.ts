import { Event, powerSaveBlocker } from 'electron';

import { isNumber } from 'lodash';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

import getUserConfig from './getUserConfig';
import storeUserConfig from './storeUserConfig';

export const disableStayAwake = async (): Promise<void> => {
  try {
    const userConfig = await getUserConfig();

    if (isNumber(userConfig?.stayAwake)) {
      const id = userConfig?.stayAwake;
      powerSaveBlocker.stop(id);

      await storeUserConfig({} as Event, {
        settings: { ...userConfig, stayAwake: false },
      });
    }
  } catch (err: any) {
    console.error('DISABLE STAY AWAKE', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};
