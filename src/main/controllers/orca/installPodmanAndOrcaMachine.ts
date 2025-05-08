/* eslint-disable @cspell/spellchecker */
/* eslint-disable no-case-declarations */

import fs from 'fs';
import os from 'os';
import path from 'path';

import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

import { checkOrcaMachineExistsAndRuns } from './checkOrcaMachineExistsAndRuns';
import { execCommandAsync } from './helpers';
import {
  installPodmanLinux,
  installPodmanMac,
  installPodmanWindows,
} from './installation';

export async function installPodmanAndOrcaMachine(): Promise<void> {
  try {
    await installPodman();
    await createSSHDirectory();
    await installOrcaVM();
  } catch (error) {
    if (process.platform === 'win32') {
      try {
        await installWSL();
      } catch (wslError) {
        const wslErrorMsg =
          wslError instanceof Error
            ? wslError.message
            : JSON.stringify(wslError);
        console.error(wslErrorMsg);
        throwDetailedError({
          detailed: `WSL installation failed: ${
            wslError instanceof Error ? wslErrorMsg : 'Unknown error'
          }`,
          type: ErrorType.GENERIC,
        });
      }
    } else {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);

      console.error(errorMsg);
      throwDetailedError({
        detailed: errorMsg,
        type: ErrorType.GENERIC,
      });
    }
  }
}

async function installPodman() {
  try {
    const { isPodmanInstalled } = await checkOrcaMachineExistsAndRuns();
    if (!isPodmanInstalled) {
      switch (process.platform) {
        case 'win32': {
          await installPodmanWindows();
          break;
        }
        case 'darwin':
          await installPodmanMac();
          break;
        case 'linux':
          await installPodmanLinux();
          break;
        default:
          throw new Error('Unsupported platform');
      }
    }
  } catch (error) {
    console.error(error);

    const { isPodmanInstalled } = await checkOrcaMachineExistsAndRuns();
    if (!isPodmanInstalled) {
      throw error;
    }
  }
}

async function createSSHDirectory() {
  const sshDir = path.join(os.homedir(), '.ssh');

  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true });
    console.log(`.ssh directory created at ${sshDir}`);
  } else {
    console.log(`.ssh directory already exists at ${sshDir}`);
  }
}

async function installOrcaVM() {
  const { isOrcaVMInstalled, isOrcaVMRunning } =
    await checkOrcaMachineExistsAndRuns();
  if (isOrcaVMRunning) {
    console.log('Stopping Orca VM');
    const stopOrcaVMCommand = 'podman machine stop orca';
    await execCommandAsync(stopOrcaVMCommand, 'Orca VM installation');
  }
  if (isOrcaVMInstalled) {
    console.log('Removing Orca VM');
    const removeOrcaVMCommand = 'podman machine rm orca';
    await execCommandAsync(removeOrcaVMCommand, 'Orca VM installation');
  }
  console.log('Installing Orca VM');
  const installOrcaVMCommand = 'podman machine init orca';
  await execCommandAsync(installOrcaVMCommand, 'Orca VM installation');
}

async function installWSL() {
  try {
    try {
      await execCommandAsync('wsl --list', 'WSL list');
    } catch {
      const { stderr } = await execCommandAsync(
        'wsl --install --no-distribution',
        'install WSL',
        true
      );
      if (stderr) {
        throw new Error(stderr);
      }
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);

    // Clean the error to remove null characters
    // eslint-disable-next-line no-control-regex
    const cleanedError = errorMsg.replace(/\u0000/g, '');

    if (cleanedError.includes('is successful')) {
      throw new Error('Reboot required');
    }

    // Throw an error if WSL installation was not successful
    if (cleanedError) {
      throw new Error(`WSL not installed: ${cleanedError}`);
    } else {
      throw new Error(`WSL not installed: ${errorMsg}`);
    }
  }
}
