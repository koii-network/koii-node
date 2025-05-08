import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getRunnedPrivateTasks } from './getRunnedPrivateTasks';

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeGet: jest.fn(),
  },
}));

describe('getRunnedPrivateTasks function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the runnedPrivateTasks array from the database', async () => {
    (namespaceInstance.storeGet as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(['task1', 'task2'])
    );

    const runnedPrivateTasks = await getRunnedPrivateTasks();

    expect(runnedPrivateTasks).toEqual(['task1', 'task2']);
  });

  it('should return an empty array and log an error if JSON parsing fails', async () => {
    (namespaceInstance.storeGet as jest.Mock).mockResolvedValueOnce(
      'invalid JSON string'
    );

    const consoleLogSpy = jest.spyOn(console, 'log');

    const runnedPrivateTasks = await getRunnedPrivateTasks();

    expect(runnedPrivateTasks).toEqual([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Get Runned Private Tasks: JSON parse error',
      expect.any(Error)
    );
  });
});
