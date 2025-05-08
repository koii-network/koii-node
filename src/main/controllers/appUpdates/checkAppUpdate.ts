import { Event } from 'electron';

import { autoUpdater, UpdateCheckResult } from 'electron-updater';

export const checkAppUpdate = (
  event: Event
): Promise<UpdateCheckResult | null> => {
  return autoUpdater.checkForUpdates();
};
