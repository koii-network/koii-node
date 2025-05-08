/* eslint-disable @cspell/spellchecker */
import fs from 'fs';
import os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

import getPlatform from './getPlatform';

const EXECUTABLE_NAME = 'Koii_Node';

const platform = getPlatform();
const arch = os.arch();
const appDataPath = getAppDataPath();

const access = promisify(fs.access);

export const UPNP_BINARY_PATH = path.join(
  `${appDataPath}`,
  '/upnp-bin/',
  `${getDownloadedExecutableName()}`
);

export function getDownloadedExecutableName() {
  let suffix = '';

  switch (platform) {
    case 'win':
      suffix = '.exe';
      break;
    default:
      break;
  }

  return EXECUTABLE_NAME + suffix;
}
export function getUpnpFileName(): string {
  let suffix = '';

  switch (platform) {
    case 'win':
      suffix = '.exe';
      break;
    case 'mac':
      suffix = arch === 'arm64' ? '_m1' : '_intel';
      break;
    default:
      break;
  }

  return `koii_network_client${suffix}`;
}

export async function checkUpnpBinaryExists(): Promise<boolean> {
  try {
    await access(UPNP_BINARY_PATH, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
