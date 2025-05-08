import { namespaceInstance } from 'main/node/helpers/Namespace';
import {
  GetTasksPairedWithVariableReturnType,
  TaskVariablesReturnType,
} from 'models';

import { PersistentStoreKeys } from '../types';

import { deleteTaskVariable } from './deleteTaskVariable';
import { getStoredTaskVariables } from './getStoredTaskVariables';
import { getTasksPairedWithVariable } from './getTasksPairedWithVariable';

jest.mock('main/node/helpers/Namespace', () => {
  return {
    namespaceInstance: {
      storeSet: jest.fn(),
    },
  };
});

jest.mock('./getStoredTaskVariables', () => {
  return {
    getStoredTaskVariables: jest.fn(),
  };
});

jest.mock('./getTasksPairedWithVariable', () => {
  return {
    getTasksPairedWithVariable: jest.fn(),
  };
});

const getStoredTaskVariablesMock = getStoredTaskVariables as jest.Mock<
  Promise<TaskVariablesReturnType>
>;
const getTasksPairedWithVariableMock = getTasksPairedWithVariable as jest.Mock<
  Promise<GetTasksPairedWithVariableReturnType>
>;

describe('deleteTaskVariable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the payload is not valid - undefined', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});

    let invalidPayload: undefined;

    await expect(
      deleteTaskVariable({} as Event, invalidPayload as unknown as string)
    ).rejects.toThrow(/payload is not valid/i);
  });

  it('throws an error if the payload is not valid - number', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});

    const invalidPayload = 123;

    await expect(
      deleteTaskVariable({} as Event, invalidPayload as never)
    ).rejects.toThrow(/payload is not valid/i);
  });

  it('throws an error if variable is not found by ID', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'some-id': { label: 'label', value: 'some value' },
    });

    const nonExistingIdPayload = 'some-other-id';

    await expect(
      deleteTaskVariable({} as Event, nonExistingIdPayload)
    ).rejects.toThrow(/task variable with ID .+ was not found/i);
  });

  it('deletes the task variable if the payload is valid and the ID does exist', async () => {
    const idForDeletion = 'already-existing-id';
    getStoredTaskVariablesMock.mockResolvedValue({
      [idForDeletion]: {
        label: 'label',
        value: 'some existing value',
      },
      'already-existing-id-2': {
        label: 'another-label',
        value: 'some another existing value',
      },
    });

    getTasksPairedWithVariableMock.mockResolvedValue([]);

    await expect(
      deleteTaskVariable({} as Event, idForDeletion)
    ).resolves.not.toThrow();

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      '{"already-existing-id-2":{"label":"another-label","value":"some another existing value"}}'
    );
  });
});
