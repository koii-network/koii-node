import { Event } from 'electron';

import { autoUpdater } from 'electron-updater';

export const downloadAppUpdate = (event: Event): Promise<string[]> => {
  return autoUpdater.downloadUpdate();
};
