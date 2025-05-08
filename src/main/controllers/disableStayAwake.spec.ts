import { powerSaveBlocker } from 'electron';

import { disableStayAwake } from './disableStayAwake';
import getUserConfig from './getUserConfig';
import storeUserConfig from './storeUserConfig';

jest.mock('./getUserConfig', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./storeUserConfig', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('electron', () => ({
  powerSaveBlocker: {
    stop: jest.fn(),
  },
}));

describe('disableStayAwake', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop the powerSaveBlocker and store updated config if has stayAwake', async () => {
    const mockUserConfig = { stayAwake: 1 };
    (getUserConfig as jest.Mock).mockResolvedValue(mockUserConfig);
    (storeUserConfig as jest.Mock).mockResolvedValue(undefined);

    await disableStayAwake();

    expect(powerSaveBlocker.stop).toHaveBeenCalledWith(
      mockUserConfig.stayAwake
    );
    expect(storeUserConfig).toHaveBeenCalledWith(
      {},
      { settings: { ...mockUserConfig, stayAwake: false } }
    );
  });

  it('should not stop the powerSaveBlocker and store updated config if stayAwake is not a number', async () => {
    const mockUserConfig = { stayAwake: 'not_a_number' };
    (getUserConfig as jest.Mock).mockResolvedValue(mockUserConfig);
    (storeUserConfig as jest.Mock).mockResolvedValue(undefined);

    await disableStayAwake();

    expect(powerSaveBlocker.stop).not.toHaveBeenCalled();
    expect(storeUserConfig).not.toHaveBeenCalled();
  });
});
