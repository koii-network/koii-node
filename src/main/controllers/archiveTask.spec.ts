import koiiTasks from '../services/koiiTasks';

import { archiveTask } from './archiveTask';
import claimReward from './claimReward';

jest.mock('main/node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn(),
}));

jest.mock('./getTaskInfo', () => ({
  getTaskInfo: jest.fn().mockReturnValue({
    availableBalances: {
      example_account: 1000,
    },
  }),
}));

jest.mock('./getStakingAccountPubKey', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('example_account'),
}));

jest.mock('./claimReward', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../services/koiiTasks', () => ({
  __esModule: true,
  default: {
    getStartedTasks: jest.fn(() => [
      {
        token_type: '',
      },
    ]),
    removeTaskFromStartedTasks: jest.fn(),
  },
}));

describe('archiveTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes task and attempts to claim rewards', async () => {
    const payload: any = {
      taskPubkey: 'example_pubkey',
    };
    await archiveTask({} as Event, payload);

    expect(claimReward).toHaveBeenCalledWith(
      {},
      { taskAccountPubKey: payload.taskPubKey, tokenType: '' }
    );
    expect(koiiTasks.removeTaskFromStartedTasks).toHaveBeenCalledWith(
      payload.taskPubKey
    );
  });
});
