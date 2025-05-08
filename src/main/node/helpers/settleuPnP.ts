/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import path from 'path';

import { fetchAndSaveUPnPBinary } from 'main/controllers/upnp/fetchAndSaveUPnPBinary';

import {
  checkUpnpBinaryExists,
  UPNP_BINARY_PATH,
} from '../../../config/upnpPathResolver';

import { getAppDataPath } from './getAppDataPath';
// Specify the log file path
const logFilePath = path.join(getAppDataPath(), 'logs', 'uPnP.log');

// Custom log function to write to the log file
function log(...args: any[]) {
  const message = args.join(' ');
  fs.appendFile(logFilePath, `${message}\n`, (err: any) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

const openPortCommand = async (port: any): Promise<boolean> => {
  let server_port = 30017;
  if (port === 443) {
    server_port = 30018;
  }

  log(`Opening port: ${port} ..........................`);
  // eslint-disable-next-line @cspell/spellchecker
  log('UPNP_BINARY_PATH', UPNP_BINARY_PATH);

  /**
   * check if upnpc binary esists
   */
  const binaryExists = await checkUpnpBinaryExists();
  log('Binary exists', binaryExists);

  if (!binaryExists) {
    /**
     * binary do not exists, fetch it from S3 bucket using controller
     */
    const binaryPath = await fetchAndSaveUPnPBinary({} as Event);

    const binaryExistsAfterFetch = await checkUpnpBinaryExists();
    log('Binary successfully saved at', binaryPath);
    log('Binary exists after fetch', binaryExistsAfterFetch);
  }

  return new Promise<boolean>((resolve, reject) => {
    //  give UPNP_BINARY_PATH executable permissions for mac os
    fs.chmodSync(UPNP_BINARY_PATH, '755');

    exec(
      `"${UPNP_BINARY_PATH}" -r ${server_port} ${port} tcp`,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error || stderr) {
          console.error(`Error: ${error?.message || stderr}`);
          reject(error);
          return;
        }
        log(`Command output: ${stdout}`);
        resolve(true);
      }
    );
  });
};

const sleep = (ms: number) => {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const closePortCommand = (port: any): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    log(`Closing port: ${port} ..........................`);
    exec(
      `"${UPNP_BINARY_PATH}" -d ${port} tcp`,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error || stderr) {
          console.error(`Error: ${error?.message || stderr}`);
          resolve(false);
          return;
        }
        log(`Command output: ${stdout}`);
        resolve(true);
      }
    );
  });
};

export default { openPortCommand, closePortCommand, sleep };
