import { app } from 'electron';

const { version } = require('../../../release/app/package.json');

export const getVersion = async (): Promise<{
  appVersion: string;
  packageVersion: string;
}> => {
  // NOTE: For dev run it will return version of Electron
  // For production it will be proper version from release/app/package.json
  return {
    appVersion: app.getVersion(),
    packageVersion: version,
  };
};
