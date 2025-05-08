import { execSync } from 'child_process';

export function checkIsInstalled(
  software: string,
  shouldPrintLogs = true
): {
  isInstalled: boolean;
  path: string;
} {
  try {
    let path: string;
    if (process.platform === 'win32') {
      path = execSync(`where ${software}`, { encoding: 'utf-8' });
    } else if (software === 'gvproxy') {
      path = execSync('ls -l /usr/libexec/podman/gvproxy', {
        encoding: 'utf-8',
      });
    } else {
      // this works for both Linux and Mac
      path = execSync(`command -v ${software}`, { encoding: 'utf-8' });
    }
    if (path.trim() === '') {
      if (shouldPrintLogs) {
        console.log(`${software} is not installed`);
      }
      return { isInstalled: false, path: '' };
    }
    if (shouldPrintLogs) {
      console.log(`${software} is installed`);
    }
    return { isInstalled: true, path };
  } catch {
    if (shouldPrintLogs) {
      console.log(`${software} is not installed`);
    }
    return { isInstalled: false, path: '' };
  }
}
