import { Event, powerSaveBlocker } from 'electron';

import { STAY_AWAKE_POLICY } from 'config/node';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

import getUserConfig from './getUserConfig';
import storeUserConfig from './storeUserConfig';

export const enableStayAwake = async (): Promise<void> => {
  try {
    const userConfig = await getUserConfig();
    const id = powerSaveBlocker.start(STAY_AWAKE_POLICY);

    await storeUserConfig({} as Event, {
      settings: { ...userConfig, stayAwake: id },
    });
  } catch (err: any) {
    console.error('SET STAY AWAKE', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};
