import os from 'os';

export const getOperativeSystem = (): 'windows' | 'macos' | 'linux' => {
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      return 'linux'; // Fallback to linux for other platforms
  }
};
