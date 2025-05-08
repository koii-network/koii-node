import { Task, TaskStatus } from 'renderer/types';

import { TaskService } from './taskService';

jest.mock('./api', () => ({
  getCurrentSlot: jest.fn(() => Promise.resolve(10000)),
}));

describe('TaskService.getStatus', () => {
  const mainAccountStakingKey = 'stakingKey';
  const baseTask: Task = {
    publicKey: 'publicKey',
    taskName: 'taskName',
    taskManager: 'taskManager',
    isWhitelisted: true,
    isActive: true,
    taskAuditProgram: 'taskAuditProgram',
    stakePotAccount: 'stakePotAccount',
    totalBountyAmount: 1000000000,
    bountyAmountPerRound: 1000000,
    currentRound: 0,
    availableBalances: {},
    stakeList: {},
    isRunning: false,
    hasError: false,
    metadataCID: 'metadataCID',
    minimumStakeAmount: 2000000000,
    roundTime: 100,
    submissions: {},
    startingSlot: 9000,
    distributionsAuditTrigger: {},
    submissionsAuditTrigger: {},
    isMigrated: false,
    migratedTo: 'string',
    distributionRewardsSubmission: {},
  };

  window.main = {
    ...window.main,
    getTaskSubmissions: jest.fn(() => Promise.resolve(baseTask.submissions)),
  };

  it('should return TaskStatus.ERROR if task hasError is true', async () => {
    const task: Task = {
      ...baseTask,
      hasError: true,
    };

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.ERROR);
  });
  it.skip('should return TaskStatus.FLAGGED if node has been flagged as malicious', async () => {
    const task: Task = {
      ...baseTask,
      distributionsAuditTrigger: {
        [mainAccountStakingKey]: {},
      },
    };

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.FLAGGED);
  });
  it.skip('should return TaskStatus.COMPLETE if the task is complete', async () => {
    const task: Task = {
      ...baseTask,
      totalBountyAmount: 10,
      bountyAmountPerRound: 20,
    };

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.COMPLETE);
  });

  it('should return TaskStatus.COOLING_DOWN if the task is not running and has submissions in some of the last 3 rounds', async () => {
    const task: Task = {
      ...baseTask,
      submissions: {
        '10': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };

    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.COOLING_DOWN);
  });

  it('should return TaskStatus.STOPPED if the task is not running and has no submissions in any of the last 3 rounds', async () => {
    const task: Task = {
      ...baseTask,
      submissions: {
        '1': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };
    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.STOPPED);
  });

  it('should return TaskStatus.PRE_SUBMISSION if there are no submissions from the current account', async () => {
    const task: Task = {
      ...baseTask,
      isRunning: true,
      submissions: {
        '9': {
          anotherAccount: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };
    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.PRE_SUBMISSION);
  });

  it('should return TaskStatus.WARMING_UP if the task is running and there are 1 or 2 submissions in the last rounds', async () => {
    const task: Task = {
      ...baseTask,
      isRunning: true,
      submissions: {
        '10': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };
    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.WARMING_UP);
  });

  it('should return TaskStatus.ACTIVE if the task is running and there are submissions in all last 3 rounds', async () => {
    const task: Task = {
      ...baseTask,
      isRunning: true,
      submissions: {
        '8': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
        '9': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
        '10': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };
    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.ACTIVE);
  });

  it('should return TaskStatus.COOLING_DOWN if the task is not running and there are submissions in some of the last 3 rounds', async () => {
    const task: Task = {
      ...baseTask,
      submissions: {
        '9': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
        '10': {
          [mainAccountStakingKey]: {
            submission_value: '',
            slot: 0,
          },
        },
      },
    };
    window.main.getTaskSubmissions = jest.fn(() =>
      Promise.resolve(task.submissions)
    );

    const result = await TaskService.getStatus(
      task,
      mainAccountStakingKey,
      false
    );
    expect(result).toBe(TaskStatus.COOLING_DOWN);
  });
});
