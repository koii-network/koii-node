/* eslint-disable @cspell/spellchecker */
import fs from 'fs';

import axios from 'axios';
import {
  getDownloadedExecutableName,
  getUpnpFileName,
} from 'config/upnpPathResolver';
import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

const executableName = getUpnpFileName();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAndSaveUPnPBinary(_: Event) {
  const binaryUrl = `https://s3.koii.network/upnp-bin-test/bin/${executableName}`;
  const appDataPath: string = getAppDataPath();
  const binaryDirectory = `${appDataPath}/upnp-bin`;
  const binaryPath = `${binaryDirectory}/${getDownloadedExecutableName()}`;

  await ensureDirectoryExists(binaryDirectory);

  const response = await axios.get(binaryUrl, {
    responseType: 'stream',
    onDownloadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`${percentCompleted}% downloaded`);
      }
    },
  });

  const writer = fs.createWriteStream(binaryPath);

  response.data.pipe(writer);

  return new Promise<string>((resolve, reject) => {
    writer.on('finish', () => {
      console.log('Download completed.');
      resolve(binaryPath);
    });

    writer.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Error downloading the binary:', err);
      reject(err);
    });
  });
}

async function ensureDirectoryExists(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
