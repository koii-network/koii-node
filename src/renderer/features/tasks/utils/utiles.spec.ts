import { Task } from 'renderer/types';

import { getTaskMessage } from './utils';

describe('getTaskMessage', () => {
  it('should return a message when the task is delisted and stopped', () => {
    const params = {
      taskIsDelistedAndStopped: true,
      task: { isWhitelisted: true, isActive: false } as Task,
      isBountyEmpty: false,
      myStakeInKoii: 0,
      isRunning: false,
      minStake: 10,
      isPrivate: false,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe(
      "This task has been delisted, but don't worry! Your tokens are safe and will be ready to unstake after 3 rounds."
    );
  });

  it('should return a message when the task is not whitelisted and is private', () => {
    const params = {
      taskIsDelistedAndStopped: false,
      task: { isWhitelisted: false } as Task,
      isBountyEmpty: false,
      myStakeInKoii: 0,
      isRunning: false,
      minStake: 10,
      isPrivate: true,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe(
      'You need to stake at least 10 KOII on this task to run it.'
    );
  });

  it('should return a message when the bounty is empty', () => {
    const params = {
      taskIsDelistedAndStopped: false,
      task: { isWhitelisted: true } as Task,
      isBountyEmpty: true,
      myStakeInKoii: 0,
      isRunning: false,
      minStake: 10,
      isPrivate: false,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe(
      'This task is inactive because the bounty is empty. The creator needs to refill the bounty before you can run it again.'
    );
  });

  it('should return a start task message when there is a stake and task is not running', () => {
    const params = {
      taskIsDelistedAndStopped: false,
      task: { isWhitelisted: true } as Task,
      isBountyEmpty: false,
      myStakeInKoii: 10,
      isRunning: false,
      minStake: 10,
      isPrivate: false,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe('Start task');
  });

  it('should return a stop task message when there is a stake and task is running', () => {
    const params = {
      taskIsDelistedAndStopped: false,
      task: { isWhitelisted: true } as Task,
      isBountyEmpty: false,
      myStakeInKoii: 10,
      isRunning: true,
      minStake: 10,
      isPrivate: false,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe('Stop task');
  });

  it('should return a message to stake more when there is no stake', () => {
    const params = {
      taskIsDelistedAndStopped: false,
      task: { isWhitelisted: true } as Task,
      isBountyEmpty: false,
      myStakeInKoii: 0,
      isRunning: false,
      minStake: 10,
      isPrivate: false,
      isBonusTask: false,
    };

    expect(getTaskMessage(params)).toBe(
      'You need to stake at least 10 KOII on this task to run it.'
    );
  });
});
