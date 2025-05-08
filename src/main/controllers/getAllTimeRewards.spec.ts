import { SystemDbKeys } from 'config/systemDbKeys';
import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getAllTimeRewards } from './getAllTimeRewards';

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeGet: jest.fn().mockReturnValue(JSON.stringify({ exampleId: 1000 })),
  },
}));

describe('getAllTimeRewards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all time rewards', async () => {
    const result = await getAllTimeRewards();

    expect(namespaceInstance.storeGet).toHaveBeenCalledWith(
      SystemDbKeys.AllTimeRewards
    );
    expect(result).toEqual({
      exampleId: 1000,
    });
  });
});
