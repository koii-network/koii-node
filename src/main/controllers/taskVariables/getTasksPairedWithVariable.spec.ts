import koiiTasks from 'main/services/koiiTasks';
import {
  GetStoredPairedTaskVariablesReturnType,
  GetTasksPairedWithVariableParamType,
  RawTaskData,
} from 'models';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';
import { getTasksPairedWithVariable } from './getTasksPairedWithVariable';

jest.mock('./getStoredPairedTaskVariables', () => {
  return {
    getStoredPairedTaskVariables: jest.fn(),
  };
});

jest.mock('main/node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn(),
}));

jest.mock('main/node/helpers/parseRawK2TaskData', () => ({
  parseRawK2TaskData: jest.fn(({ rawTaskData }) => ({
    taskName: rawTaskData.task_name,
  })),
}));

jest.mock('main/services/koiiTasks', () => ({
  getStartedTasks: jest.fn(),
}));

jest.mock('../getTasksById', () => {
  return {
    getTasksById: jest.fn(),
  };
});

const getStartedTasks = koiiTasks.getStartedTasks as unknown as jest.Mock<
  Promise<RawTaskData[]>
>;
const getStoredPairedTaskVariablesMock =
  getStoredPairedTaskVariables as jest.Mock<
    Promise<GetStoredPairedTaskVariablesReturnType>
  >;

describe('getTasksPairedWithVariable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the payload is not valid', async () => {
    const invalidPayload = {};

    await expect(
      getTasksPairedWithVariable(
        {} as Event,
        invalidPayload as GetTasksPairedWithVariableParamType
      )
    ).rejects.toThrow(/payload is not valid/);
  });

  it("should return empty array if none of the Tasks is using given variable by it's ID", async () => {
    const taskId = 'id1';

    getStartedTasks.mockResolvedValueOnce([]);

    getStoredPairedTaskVariablesMock.mockResolvedValue({
      [taskId]: { name: 'varId' },
    });

    await expect(
      getTasksPairedWithVariable({} as Event, {
        variableId: 'anotherVarId',
      })
    ).resolves.toEqual([]);
  });

  it("should return Task using given variable by it's ID", async () => {
    const taskId = 'id1';
    const varId = 'variableId';
    const taskName = 'Task Name 1';

    getStartedTasks.mockResolvedValue([
      {
        task_id: taskId,
        task_name: taskName,
      },
    ] as RawTaskData[]);

    getStoredPairedTaskVariablesMock.mockResolvedValue({
      [taskId]: { name: varId },
    });

    await expect(
      getTasksPairedWithVariable({} as Event, { variableId: varId })
    ).resolves.toEqual([
      {
        publicKey: taskId,
        data: {
          taskName,
        },
      },
    ]);
  });
});
