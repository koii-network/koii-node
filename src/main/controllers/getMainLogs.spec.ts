import { shell } from 'electron';
import { join } from 'path';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

import { getMainLogs, getLogFilePath } from './getMainLogs';

jest.mock('electron', () => ({
  shell: {
    openPath: jest.fn(),
  },
}));

jest.mock('main/node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn(),
}));

const getAppDataPathMocked = getAppDataPath as jest.Mock;
const openPathMocked = shell.openPath as jest.Mock;

describe('getLogFilePath', () => {
  it('returns correct appdata path', () => {
    const getAppDataPath = () => join('path', 'to', 'appdata');

    const result = getLogFilePath(getAppDataPath);

    expect(result).toEqual(join('path', 'to', 'appdata', 'logs', 'main.log'));
  });

  it('throws error when failed to get appdata path', () => {
    const getAppDataPath = () => {
      throw new Error();
    };

    expect(() => getLogFilePath(getAppDataPath)).toThrow(
      'Failed to get app data path'
    );
  });
});

describe('getMainLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if log file is opened successfully', async () => {
    getAppDataPathMocked.mockReturnValue(join('path', 'to', 'appdata'));
    openPathMocked.mockReturnValue('success');
    const result = await getMainLogs({} as Event);

    expect(result).toBe(true);
    expect(getAppDataPath).toHaveBeenCalled();
    expect(shell.openPath).toHaveBeenCalledWith(
      join('path', 'to', 'appdata', 'logs', 'main.log')
    );
  });

  it('should throw an error if file open fails', async () => {
    getAppDataPathMocked.mockReturnValue(join('path', 'to', 'appdata'));
    openPathMocked.mockResolvedValue('Failed to open path');

    await expect(getMainLogs({} as Event)).rejects.toThrow();
    expect(getAppDataPath).toHaveBeenCalled();
    expect(shell.openPath).toHaveBeenCalledWith(
      join('path', 'to', 'appdata', 'logs', 'main.log')
    );
  });
});
