import { app } from 'electron';
import path from 'path';

import { getAppDataPath } from './getAppDataPath';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(),
  },
}));

jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join()),
}));

describe('getAppDataPath', () => {
  const exitMock = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    Object.defineProperty(process, 'exit', {
      value: exitMock,
    });
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return "./appdata" for development environment', () => {
    const mockPath = '/mock/appData/path';
    (app.getPath as jest.Mock).mockReturnValue(mockPath);
    (path.join as jest.Mock).mockReturnValue(mockPath);
    Object.defineProperty(process, 'env', {
      value: { DB_MODE: 'development', NODE_ENV: 'development' },
    });
    const result = getAppDataPath(true);
    expect(result).toBe(mockPath);
    expect(app.getPath).toHaveBeenCalledWith('appData');
    expect(path.join).toHaveBeenCalledWith(mockPath, 'KOII-Desktop-Node-dev');
  });

  it('should return correct app data path for supported platforms', () => {
    const mockPath = '/mock/appData/path';
    (app.getPath as jest.Mock).mockReturnValue(mockPath);
    (path.join as jest.Mock).mockReturnValue(mockPath);
    Object.defineProperty(process, 'env', {
      value: { DB_MODE: 'production', NODE_ENV: 'production' },
    });

    const platformsSupported = ['darwin', 'win32', 'linux'];
    platformsSupported.forEach((platform) => {
      Object.defineProperty(process, 'platform', {
        value: platform,
      });
      const result = getAppDataPath();
      expect(result).toBe(mockPath);
      expect(app.getPath).toHaveBeenCalledWith('appData');
      expect(path.join).toHaveBeenCalledWith(mockPath, 'KOII-Desktop-Node');
    });
  });

  it('should call process.exit for unsupported platforms', () => {
    Object.defineProperty(process, 'env', {
      value: { DB_MODE: 'production', NODE_ENV: 'production' },
    });
    Object.defineProperty(process, 'platform', {
      value: 'unsupportedPlatform',
    });
    getAppDataPath();
    expect(console.log).toHaveBeenCalledWith('Unsupported platform!');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
