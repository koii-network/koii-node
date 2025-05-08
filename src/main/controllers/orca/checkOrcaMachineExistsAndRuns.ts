import { exec } from 'child_process';

import { checkOrcaMachineExistsAndRunsResponse } from 'models/api';

import { checkIsInstalled } from './helpers';

export const checkOrcaMachineExistsAndRuns = async (
  _event?: Event,
  shouldPrintLogs = true
): Promise<checkOrcaMachineExistsAndRunsResponse> => {
  let isPodmanInstalled = false;
  let isOrcaVMInstalled = false;
  let isOrcaVMRunning = false;
  try {
    ({ isInstalled: isPodmanInstalled } = checkIsInstalled(
      'podman',
      shouldPrintLogs
    ));
    if (isPodmanInstalled) {
      if (process.platform === 'linux') {
        const { isInstalled: isGvproxyInstalled } = checkIsInstalled(
          'gvproxy',
          shouldPrintLogs
        );
        if (!isGvproxyInstalled) {
          return {
            isPodmanInstalled: false,
            isOrcaVMInstalled: false,
            isOrcaVMRunning: false,
          };
        }
      }
      ({ isOrcaVMInstalled, isOrcaVMRunning } = await checkOrcaStatus(
        shouldPrintLogs
      ));
    }
    return { isPodmanInstalled, isOrcaVMInstalled, isOrcaVMRunning };
  } catch (error) {
    if (error instanceof Error && !error.message.includes('not found')) {
      console.error(error.message);
    }
    return { isPodmanInstalled, isOrcaVMInstalled, isOrcaVMRunning };
  }
};

function checkOrcaStatus(shouldPrintLogs = true): Promise<{
  isOrcaVMInstalled: boolean;
  isOrcaVMRunning: boolean;
}> {
  const lsCommand = 'podman machine ls';

  return new Promise((resolve, reject) => {
    exec(lsCommand, (error, stdout) => {
      if (error) {
        // Podman is not installed or an error occurred
        console.error(error);
        reject(error);
      } else {
        // Podman is installed and the command executed successfully
        const orcaText = 'orca';
        const runningText = 'Currently running';
        if (shouldPrintLogs) {
          console.log(stdout);
        }
        if (stdout.includes(orcaText)) {
          if (stdout.includes(runningText)) {
            if (shouldPrintLogs) {
              console.log('Orca virtual machine is running');
            }
            resolve({ isOrcaVMInstalled: true, isOrcaVMRunning: true });
          } else {
            resolve({ isOrcaVMInstalled: true, isOrcaVMRunning: false });
          }
        } else {
          // In case the podman VM was never initialized
          resolve({ isOrcaVMInstalled: false, isOrcaVMRunning: false });
        }
      }
    });
  });
}
