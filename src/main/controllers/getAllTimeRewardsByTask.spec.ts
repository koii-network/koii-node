import { getAllTimeRewards } from './getAllTimeRewards';
import { getAllTimeRewardsByTask } from './getAllTimeRewardsByTask';

jest.mock('./getAllTimeRewards', () => ({
  __esModule: true,
  getAllTimeRewards: jest.fn().mockReturnValue({ exampleTaskId: 1000 }),
}));

describe('getAllTimeRewardsByTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns task rewards', async () => {
    const taskId = 'exampleTaskId';

    const result = await getAllTimeRewardsByTask({} as Event, { taskId });

    expect(getAllTimeRewards).toHaveBeenCalled();
    expect(result).toBe(1000);
  });
});
