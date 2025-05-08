import { BrowserWindow, dialog } from 'electron';
import path from 'path';

import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { RendererEndpoints } from 'config/endpoints';

import { app } from './app';
import { getUserConfig } from './controllers';
import { getAppDataPath } from './node/helpers/getAppDataPath';

const CHECK_INTERVAL = 6 * 1000 * 60 * 60;

let interval: NodeJS.Timer | null = null;

export async function initializeAppUpdater(
  mainWindow: BrowserWindow | undefined,
  appCleanup: () => Promise<void>
) {
  await configureUpdater();
  createCheckForTheUpdatesInterval();
  setListeners(mainWindow, appCleanup);
}

export function checkForUpdates() {
  return autoUpdater.checkForUpdatesAndNotify();
}

async function configureUpdater() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.allowDowngrade = true;
  autoUpdater.autoInstallOnAppQuit = false;

  console.log(
    'original updater cache path ',
    (autoUpdater as any).app.baseCachePath
  );
  Object.defineProperty((autoUpdater as any).app, 'baseCachePath', {
    get() {
      return path.join(getAppDataPath(), 'updater-cache');
    },
  });
  console.log(
    'overwritten updater cache path ',
    (autoUpdater as any).app.baseCachePath
  );
}

function setListeners(
  mainWindow: BrowserWindow | undefined,
  appCleanup: () => Promise<void>
) {
  autoUpdater.on('update-available', (info) => {
    getUserConfig()
      .then((appConfig) => {
        // const mainWindow = BrowserWindow.getFocusedWindow();
        if (!appConfig?.autoUpdatesDisabled) {
          // If autoUpdatesDisabled is not set, autoupdates are enabled
          // if auto updates are enabled, download the update
          autoUpdater.downloadUpdate();
        } else if (mainWindow) {
          // if auto updates are disabled, inform the user about the update
          mainWindow.webContents.send(RendererEndpoints.UPDATE_AVAILABLE, info);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    console.log(info);

    getUserConfig()
      .then((appConfig) => {
        if (appConfig?.autoUpdatesDisabled) {
          mainWindow?.webContents.send(RendererEndpoints.UPDATE_DOWNLOADED);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    setTimeout(() => {
      dialog
        .showMessageBox({
          type: 'question',
          title: 'Koii Node',
          buttons: ['Update and Restart', 'Update Later'],
          defaultId: 0,
          message: 'Do you want to update and restart now?',
          detail: `Get the latest version: ${info.version}`,
        })
        .then(async (selection) => {
          if (selection.response === 0) {
            // User clicked 'Restart & Update'
            await appCleanup();
            app.isQuitting = true;
            autoUpdater.quitAndInstall();
          }
        });
    }, 2000);
  });
}

function createCheckForTheUpdatesInterval() {
  if (!interval) {
    interval = setInterval(() => {
      console.log('interval update check');
      autoUpdater.checkForUpdates();
    }, CHECK_INTERVAL);
  }

  // runs the first check 25sec after the app initialization
  setTimeout(() => {
    console.log('initial update check');
    autoUpdater.checkForUpdates();
  }, 25000);
}
