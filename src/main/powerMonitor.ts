import { BrowserWindow, powerMonitor } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

import { enableStayAwake, getUserConfig, initializeTasks } from './controllers';
import koiiTasks from './services/koiiTasks';

const initializeStayAwake = async () => {
  const userConfig = await getUserConfig();
  const stayAwakeHasBeenManuallyDisabledByUser =
    userConfig?.stayAwake === false;
  if (!stayAwakeHasBeenManuallyDisabledByUser) {
    await enableStayAwake();
  }
};

const setUpPowerMonitoring = async () => {
  powerMonitor.on('suspend', async () => {
    console.log('SYSTEM SUSPENDED');

    const runningTasksPubKeys = Object.keys(koiiTasks.RUNNING_TASKS);
    for (const pubKey of runningTasksPubKeys) {
      console.log('STOPPING ONGOING TASK: ', pubKey);
      await koiiTasks.stopTask(pubKey, true);
    }

    console.log('ALL ONGOING TASKS WERE STOPPED');
  });

  powerMonitor.on('resume', async () => {
    console.log('SYSTEM RESUMED');
    const appWindow = BrowserWindow.getAllWindows()[0];
    console.log('RESUMING ONGOING TASKS');
    await initializeTasks();
    // delay notifying renderer process to allow the tasks to start
    setTimeout(() => {
      try {
        appWindow?.webContents.send(RendererEndpoints.SYSTEM_WAKE_UP);
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  });
};

export const setUpPowerStateManagement = async () => {
  await initializeStayAwake();
  await setUpPowerMonitoring();
};
