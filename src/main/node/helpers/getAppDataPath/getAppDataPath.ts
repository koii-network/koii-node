import { app } from 'electron';
import path from 'path';

const platformsSupported = ['darwin', 'win32', 'linux'];

// eslint-disable-next-line consistent-return
export function getAppDataPath(isDev = isDevMode()) {
  const useDevDB = process.env.DB_MODE === 'development' && isDev;
  const applicationDataFolder = useDevDB
    ? 'KOII-Desktop-Node-dev'
    : 'KOII-Desktop-Node';

  if (platformsSupported.includes(process.platform))
    return path.join(app.getPath('appData'), applicationDataFolder);
  else {
    console.log('Unsupported platform!');
    process.exit(1);
  }
}

const isDevMode = () => {
  return process.env.NODE_ENV === 'development';
};
