/* eslint-disable @cspell/spellchecker */
import {
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
  Tray,
} from 'electron';
import fs from 'fs/promises';
import path from 'path';

import { initialize, trackEvent } from '@aptabase/electron/main';

import { RendererEndpoints } from 'config/endpoints';
import { get } from 'lodash';
import { UserAppConfig } from 'models';

import { app } from './app';
import { initializeAppUpdater } from './AppUpdater';
import {
  copyBrandingFolder,
  getAllAccounts,
  getUserConfig,
  setActiveAccount,
  stopOrcaVM,
  storeUserConfig,
} from './controllers';
import db from './db';
import { handleDeepLinks } from './handleDeepLinks';
import initHandlers from './initHandlers';
import { configureLogger } from './logger';
import { getCurrentActiveAccountName } from './node/helpers';
import { getAppDataPath } from './node/helpers/getAppDataPath';
import execute from './node/helpers/settleuPnP';
import { setUpPowerStateManagement } from './powerMonitor';
import ExecutableMonitor from './services/ExecutableMonitorService';
import koiiTasks from './services/koiiTasks';
import { resolveHtmlPath, sleep } from './util';

const isDev = process.env.NODE_ENV === 'development';
const isDebug = isDev || process.env.DEBUG_PROD === 'true';

if (process.env.APTABASE_INT) initialize(process.env.APTABASE_INT);

const isMac = process.platform === 'darwin';
let tray: Tray | null = null;

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDebug) {
  // eslint-disable-next-line global-require
  require('electron-debug')();
}

const startExecutableMonitor = async (mainWindow: BrowserWindow) => {
  const appDataPath = getAppDataPath();
  const executablesDirPath = path.join(appDataPath, 'executables');

  const executableMonitor = new ExecutableMonitor({
    folderPath: executablesDirPath,
    sendAlert: async (executable, file) => {
      // eslint-disable-next-line no-console
      mainWindow.webContents.send(RendererEndpoints.TASK_EXECUTABLE_CHANGED, {
        executable,
        file,
      });
    },
  });
  executableMonitor.start();
};

const closePortConnection = async () => {
  await db.get('curr_port').then(async (port: any) => {
    if (port !== '0') {
      await execute.closePortCommand(port);
      await db.put('curr_port', '0');
    }
  });
  await db.put('Port_Exposure', 'Pending');
};

export const appCleanup = async () => {
  console.log('Cleaning up the app');
  try {
    /**
     * processes cleanup
     */
    koiiTasks.stopTasksOnAppQuit();
    await sleep(2500);
    await closePortConnection();
    // Suppressing the error from printing
    await stopOrcaVM().catch((err) => err);
  } catch (error) {
    console.log(error);
  }
  console.timeEnd('Session duration');
};

const setLaunchOnRestartOnByDefault = async (userConfig: UserAppConfig) => {
  const launchOnRestart = get(userConfig, 'launchOnRestart');
  console.log({ launchOnRestart });
  const launchOnRestartWasNeverSet = launchOnRestart === undefined;

  if (launchOnRestartWasNeverSet) {
    app.setLoginItemSettings({
      openAtLogin: true,
    });

    await storeUserConfig({} as Event, {
      settings: { ...userConfig, launchOnRestart: true },
    });
  }
};

const installExtensions = async () => {
  // eslint-disable-next-line global-require
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const main = async (): Promise<void> => {
  initHandlers();

  await getCurrentActiveAccountName().catch(async () => {
    console.warn(
      'NO ACTIVE ACCOUNT IN DB - setting first available account as active'
    );
    const allAccounts = await getAllAccounts({} as Event);

    if (allAccounts[0]) {
      await setActiveAccount({} as Event, {
        accountName: allAccounts[0].accountName,
      });
    }
  });
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const userConfig = await getUserConfig();

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 1740,
    height: 1040,
    minWidth: 1152,
    minHeight: 810,

    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Set initial zoom level
  mainWindow.webContents.setZoomLevel(-0.3);

  // Force zoom level back to -0.3 when it changes
  mainWindow.webContents.on('zoom-changed', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  // Maintain zoom level after navigation
  mainWindow.webContents.on('did-navigate', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  // Maintain zoom level after navigation within the page
  mainWindow.webContents.on('did-navigate-in-page', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  // Handle maximize/unmaximize events
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  // Handle resize events
  mainWindow.on('resize', () => {
    mainWindow?.webContents.setZoomLevel(-0.3);
  });

  startExecutableMonitor(mainWindow);

  Menu.setApplicationMenu(null);

  app.on('before-quit', async () => {
    if (app.isQuitting) return;
    await appCleanup();

    trackEvent('app_closed');
    app.isQuitting = true;
    app.quit();
  });

  const limitLogsSize = get(userConfig, 'limitLogsSize', false);

  configureLogger(limitLogsSize);

  console.time('Session duration');

  await setLaunchOnRestartOnByDefault(userConfig);

  await initializeAppUpdater(mainWindow, appCleanup);

  await setUpPowerStateManagement();

  try {
    const brandingSourcePath = app.isPackaged
      ? path.join(process.resourcesPath, 'branding')
      : path.join(__dirname, '../../branding');

    // Check if branding folder exists
    await fs.access(brandingSourcePath);

    // Copy branding folder to app data
    await copyBrandingFolder({} as Event, brandingSourcePath);
    console.log('Successfully copied branding folder to app data');
  } catch (error) {
    console.error('Branding folder error:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
  }

  await main()
    .then(async () => {
      mainWindow?.on('ready-to-show', async () => {
        if (!mainWindow) {
          throw new Error('"mainWindow" is not defined');
        }

        if (process.env.START_MINIMIZED) {
          mainWindow.minimize();
        } else {
          mainWindow.show();
        }
      });
    })
    .catch((err): void => {
      dialog.showErrorBox('Something went wrong!', err.message);
      trackEvent('app_error', { error: err.message });
      app.quit();
    });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('koii-node', process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient('koii-node');
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
      // Minimize the window instead of closing
    }
  });
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception ->', error);
});

dialog.showErrorBox = (title, content) => {
  console.log(`[Error Box]: ${title}\n${content}`);
};

const createMenu = () => {
  const template = [
    ...(process.platform === 'darwin'
      ? ([
          {
            label: app.getName(),
            submenu: [
              {
                label: 'FAQ',
                click: () => {
                  shell.openExternal('https://docs.koii.network/koii/faq');
                },
              },
              {
                label: 'Report an issue',
                click: () => {
                  shell.openExternal('https://discord.gg/koii-network');
                },
              },
              {
                label: 'Hide',
                accelerator: 'CmdOrCtrl+H',
                click: () => {
                  mainWindow?.hide();
                },
              },
              {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: () => {
                  app.quit();
                },
              },
            ],
          },
          {
            label: 'Edit',
            submenu: [
              { label: 'Undo', role: 'undo' },
              { label: 'Redo', role: 'redo' },
              { type: 'separator' },
              { label: 'Cut', role: 'cut' },
              { label: 'Copy', role: 'copy' },
              { label: 'Paste', role: 'paste' },
              { type: 'separator' },
              // eslint-disable-next-line @cspell/spellchecker
              { label: 'Select All', role: 'selectall' },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: 'Window',
      submenu: [
        {
          label: 'Zoom In',
          // eslint-disable-next-line @cspell/spellchecker
          role: 'zoomin',
          accelerator: 'CommandOrControl+=',
        },
        {
          label: 'Zoom Out',
          // eslint-disable-next-line @cspell/spellchecker
          role: 'zoomout',
          accelerator: 'CommandOrControl+-',
        },
        {
          label: 'Hide',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow?.hide();
          },
        },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    } as MenuItemConstructorOptions,
    {
      label: 'Help',
      submenu: [
        {
          label: 'FAQ',
          click: () => {
            shell.openExternal('https://docs.koii.network/koii/faq');
          },
        },
        {
          label: 'Report an issue',
          click: () => {
            shell.openExternal('https://discord.gg/koii-network');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

function createTray() {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  const iconPath = getAssetPath('icons/trayIcon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        if (mainWindow) mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Koii Node');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.focus();
      mainWindow.show();
    }
  });
  tray.on('right-click', () => {
    if (tray) tray.popUpContextMenu();
  });
  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}
app.on('activate', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    } else if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.focus();
  } else {
    // Recreate the window if it doesn't exist
    createWindow();
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLinks([url]);
});

// Check for a single instance
const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  /**
   * @dev remove selected tasks from the the DB cache
   * Some users might still have cache reciods in the neDB, so we need to remove them
   * The DB cache is not used anymore because of its performance issues
   */
  await db.put('startedTasksCache', '');
  // We manually compact the datafile to avoid the file growing indefinitely until app restart,
  // as caching task states handles big chunks of data.
  db.compactDatafile();
  createWindow();
  createMenu();
  createTray();
  trackEvent('app_started');

  app.on('second-instance', async (_e: Electron.Event, argv: string[]) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    await handleDeepLinks(argv);
  });

  await handleDeepLinks(process.argv);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createMenu();
    createTray();
  }
});

app.on('will-quit', () => {
  app.isQuitting = true;
});

const TEN_MINUTES = 10 * 60 * 1000;

setInterval(() => {
  console.log('memory usage', process.memoryUsage());
}, TEN_MINUTES);
