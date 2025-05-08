import { Event, app } from 'electron';

import { get } from 'lodash';

import { ErrorType } from '../../models';
import { throwDetailedError } from '../../utils';

import getUserConfig from './getUserConfig';
import storeUserConfig from './storeUserConfig';

export const switchLaunchOnRestart = async (): Promise<void> => {
  try {
    const userConfig = await getUserConfig();

    const launchOnRestart = get(userConfig, 'launchOnRestart', false);
    app.setLoginItemSettings({
      openAtLogin: !launchOnRestart,
    });

    await storeUserConfig({} as Event, {
      settings: { ...userConfig, launchOnRestart: !launchOnRestart },
    });
  } catch (err: any) {
    console.error('SET LAUNCH ON RESTART', err);
    return throwDetailedError({
      detailed: err,
      type: ErrorType.GENERIC,
    });
  }
};
