import { powerSaveBlocker } from 'electron';

import { STAY_AWAKE_POLICY } from 'config/node';

import { enableStayAwake } from './enableStayAwake';
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
    start: jest.fn().mockReturnValue(100),
  },
}));

describe('enableStayAwake', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts powerSaveBlocker and save user configs', async () => {
    const mockUserConfig = { example: 'example' };
    (getUserConfig as jest.Mock).mockResolvedValue(mockUserConfig);
    (storeUserConfig as jest.Mock).mockResolvedValue(undefined);

    await enableStayAwake();

    expect(powerSaveBlocker.start).toHaveBeenCalledWith(STAY_AWAKE_POLICY);
    expect(storeUserConfig).toHaveBeenCalledWith(
      {},
      { settings: { ...mockUserConfig, stayAwake: 100 } }
    );
  });
});
