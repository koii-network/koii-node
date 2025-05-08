import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getAllTimeRewards } from './getAllTimeRewards';
import { storeAllTimeRewards } from './storeAllTimeRewards';

jest.mock('main/node/helpers/Namespace', () => ({
  __esModule: true,
  namespaceInstance: {
    storeSet: jest.fn(),
  },
}));

jest.mock('./getAllTimeRewards', () => ({
  __esModule: true,
  getAllTimeRewards: jest.fn().mockReturnValue({ exampleTaskId: 1000 }),
}));

describe('storeAllTimeRewards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Sets new all time rewards', async () => {
    const payload = {
      taskId: 'exampleTaskId',
      newReward: 2000,
    };

    const result = await storeAllTimeRewards({} as Event, payload);

    expect(getAllTimeRewards).toHaveBeenCalled();
    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      SystemDbKeys.AllTimeRewards,
      '{"exampleTaskId":3000}'
    );
    expect(result).toBeTruthy();
  });
});
