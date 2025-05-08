import fs from 'fs';
import path from 'path';

import log from 'electron-log';

import { getAppDataPath } from './node/helpers/getAppDataPath';

export function configureLogger(limitLogsSize?: boolean) {
  log.transports.file.level = 'info';

  log.transports.file.resolvePath = () => `${getAppDataPath()}/logs/main.log`;

  if (limitLogsSize) {
    setMaxLogSize(5);
  }

  // overwrite default console with electron-log functions
  Object.assign(console, log.functions);
}

export function setMaxLogSize(sizeInMB: number | null) {
  if (sizeInMB === null) {
    log.transports.file.maxSize = Infinity;
    return;
  }

  log.transports.file.maxSize = sizeInMB * 1024 * 1024;
}

export function clearArchivedLogs() {
  const logsDirectory = path.join(getAppDataPath(), 'logs');

  fs.readdir(logsDirectory, (err, files) => {
    if (err) {
      console.error('Error reading logs directory:', err);
      return;
    }

    // Filter for archived logs (assuming they end in '.old.log' or contain '.old.' in their name)
    const archivedLogs = files.filter((file) => file.includes('.old.'));

    archivedLogs.forEach((logFile) => {
      const logFilePath = path.join(logsDirectory, logFile);
      fs.unlink(logFilePath, (err) => {
        if (err) {
          console.error(`Error deleting archived log ${logFile}:`, err);
        } else {
          console.info(`Successfully deleted archived log ${logFile}`);
        }
      });
    });
  });
}
