/* eslint-disable global-require */
/* eslint-disable @cspell/spellchecker */
import { Event } from 'electron';

import claimReward from './claimReward';
import delegateStake from './delegateStake';
import { getIsTaskRunning } from './getIsTaskRunning';
import { getTaskInfo } from './getTaskInfo';
import { getRunnedPrivateTasks, setRunnedPrivateTask } from './privateTasks';
import startTask from './startTask';
import stopTask from './stopTask';
import { getPairedTaskVariableData, pairTaskVariable } from './taskVariables';
import { upgradeTask } from './upgradeTask';
import withdrawStake from './withdrawStake';

const MOCKED_STAKING_PUBLIC_KEY = 'staking-pubkey';
const MOCKED_OLD_TASK_PUBLIC_KEY = 'old-test-pubkey';
const MOCKED_NEW_TASK_PUBLIC_KEY = 'new-test-pubkey';

jest.mock('is-ipfs', () => ({
  cid: jest.fn(),
}));
jest.mock('web3.storage', () => ({
  Web3Storage: jest.fn(),
}));
jest.mock('./startTask', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./getAllTimeRewardsByTask', () => ({
  getAllTimeRewardsByTask: jest.fn(),
}));
jest.mock('./storeAllTimeRewards', () => ({
  storeAllTimeRewards: jest.fn(),
}));
jest.mock('./delegateStake', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./getStakingAccountPubKey', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve(MOCKED_STAKING_PUBLIC_KEY)),
}));
jest.mock('./taskVariables', () => ({
  getPairedTaskVariableData: jest.fn(),
  pairTaskVariable: jest.fn(),
}));
jest.mock('./privateTasks', () => ({
  getRunnedPrivateTasks: jest.fn(),
  setRunnedPrivateTask: jest.fn(),
}));
jest.mock('./getTaskInfo', () => ({
  getTaskInfo: jest.fn(() => ({
    stakePotAccount: 'stakePotAccount',
    isWhitelisted: true,
  })),
}));
jest.mock('./getIsTaskRunning', () => ({
  getIsTaskRunning: jest.fn(),
}));
jest.mock('./stopTask', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./claimReward', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./withdrawStake', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('electron', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  const tempDirectory = path.join(os.tmpdir(), 'temporary-folder-name');
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
  }
  return {
    app: {
      getPath: jest.fn().mockReturnValue(tempDirectory),
    },
  };
});

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  rmdirSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

const tokenType = '';

jest.mock('main/util', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

describe('upgradeTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stops the old task if it is running', async () => {
    (getIsTaskRunning as jest.Mock).mockResolvedValueOnce(true);

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
    };

    await upgradeTask({} as Event, params);

    expect(stopTask).toHaveBeenCalledWith(
      {},
      { taskAccountPubKey: MOCKED_OLD_TASK_PUBLIC_KEY }
    );
  });

  it('unstakes from old task if there is a stake', async () => {
    (getTaskInfo as jest.Mock).mockResolvedValue({
      stakeList: { [MOCKED_STAKING_PUBLIC_KEY]: 5000000000 },
    });

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
    };

    await upgradeTask({} as Event, params);

    expect(withdrawStake).toHaveBeenCalledWith(
      {},
      {
        shouldCheckCachedStake: false,
        taskAccountPubKey: MOCKED_OLD_TASK_PUBLIC_KEY,
        taskType: 'KOII',
      }
    );
  });

  it('claims rewards if there are pending rewards for the staking account', async () => {
    (getTaskInfo as jest.Mock).mockResolvedValue({
      availableBalances: { [MOCKED_STAKING_PUBLIC_KEY]: 5000000000 },
    });

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
    };

    await upgradeTask({} as Event, params);

    expect(claimReward).toHaveBeenCalledWith(
      {},
      { taskAccountPubKey: MOCKED_OLD_TASK_PUBLIC_KEY, tokenType }
    );
  });

  it('delegates stake to the new task', async () => {
    (getTaskInfo as jest.Mock).mockResolvedValue({
      isActive: true,
    });

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
      useStakingWalletForStake: true,
    };

    await upgradeTask({} as Event, params);

    expect(delegateStake).toHaveBeenCalledWith(
      {},
      {
        stakeAmount: 10,
        stakePotAccount: undefined,
        taskAccountPubKey: MOCKED_NEW_TASK_PUBLIC_KEY,
        taskType: 'KOII',
        useStakingWallet: true,
        skipIfItIsAlreadyStaked: true,
      }
    );
  });

  it('migrates task variables', async () => {
    (getPairedTaskVariableData as jest.Mock).mockResolvedValue({
      taskPairings: {
        testVar1: 'desktopVar1',
        testVar2: 'desktopVar2',
      },
    });
    (getTaskInfo as jest.Mock).mockResolvedValue({
      isActive: true,
    });

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
    };

    await upgradeTask({} as Event, params);

    expect(pairTaskVariable).toHaveBeenNthCalledWith(
      1,
      {},
      {
        desktopVariableId: 'desktopVar1',
        taskAccountPubKey: 'new-test-pubkey',
        variableInTaskName: 'testVar1',
      }
    );
    expect(pairTaskVariable).toHaveBeenNthCalledWith(
      2,
      {},
      {
        desktopVariableId: 'desktopVar2',
        taskAccountPubKey: 'new-test-pubkey',
        variableInTaskName: 'testVar2',
      }
    );
  });

  it('starts a new private task if old task is private and new task is not whitelisted', async () => {
    (getTaskInfo as jest.Mock).mockResolvedValue({
      isActive: true,
      isWhitelisted: false,
      stakePotAccount: 'stakePotAccount',
    });
    (getRunnedPrivateTasks as jest.Mock).mockResolvedValue([
      MOCKED_OLD_TASK_PUBLIC_KEY,
    ]);

    const params = {
      oldPublicKey: MOCKED_OLD_TASK_PUBLIC_KEY,
      newPublicKey: MOCKED_NEW_TASK_PUBLIC_KEY,
      newStake: 10,
      tokenType,
    };

    await upgradeTask({} as Event, params);

    expect(setRunnedPrivateTask).toHaveBeenCalledWith(
      {},
      { runnedPrivateTask: MOCKED_NEW_TASK_PUBLIC_KEY }
    );
    expect(startTask).toHaveBeenCalledWith(
      {},
      {
        taskAccountPubKey: MOCKED_NEW_TASK_PUBLIC_KEY,
        isPrivate: true,
        forceRefetch: true,
      }
    );
  });
});
