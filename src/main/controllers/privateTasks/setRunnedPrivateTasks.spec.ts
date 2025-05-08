import { Event } from 'electron';

import { namespaceInstance } from 'main/node/helpers/Namespace';

import { PersistentStoreKeys } from '../types';

import { getRunnedPrivateTasks } from './getRunnedPrivateTasks'; // Update the import path accordingly
import { setRunnedPrivateTask } from './setRunnedPrivateTasks';

// Mocking the namespaceInstance
jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeGet: jest.fn(),
    storeSet: jest.fn(),
  },
}));

jest.mock('./getRunnedPrivateTasks', () => ({
  getRunnedPrivateTasks: jest.fn(),
}));

describe('addRunnedPrivateTask function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new runnedPrivateTask and update the database', async () => {
    (getRunnedPrivateTasks as jest.Mock).mockResolvedValueOnce([
      'task1',
      'task2',
    ]);

    await setRunnedPrivateTask({} as Event, { runnedPrivateTask: 'newTask' });

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.RunnedPrivateTasks,
      JSON.stringify(['task1', 'task2', 'newTask'])
    );
  });
});
