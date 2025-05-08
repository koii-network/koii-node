import { namespaceInstance } from 'main/node/helpers/Namespace';
import { EditTaskVariableParamType } from 'models';

import { PersistentStoreKeys } from '../types';

import { editTaskVariable } from './editTaskVariable';
import { getStoredTaskVariables } from './getStoredTaskVariables';

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

const getStoredTaskVariablesMock = getStoredTaskVariables as jest.Mock;

describe('editTaskVariable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the payload is not valid', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});

    const invalidPayload = {};

    await expect(
      editTaskVariable({} as Event, invalidPayload as never)
    ).rejects.toThrow();
  });

  it('throws an error if variable is not found by id', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'some-id': { label: 'label', value: 'some value' },
    });

    const nonExistingIdPayload: EditTaskVariableParamType = {
      variableId: 'some-other-id',
      variableData: {
        label: 'another label',
        value: 'some value',
      },
    };

    await expect(
      editTaskVariable({} as Event, nonExistingIdPayload)
    ).rejects.toThrow();
  });

  it('throws an error if variable is found by ID but there is other variable with given label', async () => {
    const existingLabel = 'label';
    getStoredTaskVariablesMock.mockResolvedValue({
      'some-id': { label: 'label to change', value: 'some value' },
      'some-other-id': { label: existingLabel, value: 'some value' },
    });

    const nonExistingIdPayload: EditTaskVariableParamType = {
      variableId: 'some-other-new-id',
      variableData: {
        label: existingLabel,
        value: 'some other value',
      },
    };

    await expect(
      editTaskVariable({} as Event, nonExistingIdPayload)
    ).rejects.toThrow();
  });

  it('changes the task variable label and value if the payload is valid and the ID does exist', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'already-existing-id': {
        label: 'old label',
        value: 'old value',
      },
    });

    const validPayload: EditTaskVariableParamType = {
      variableId: 'already-existing-id',
      variableData: { label: 'new label', value: 'new value' },
    };

    await expect(
      editTaskVariable({} as Event, validPayload)
    ).resolves.not.toThrow();

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      '{"already-existing-id":{"label":"new label","value":"new value"}}'
    );
  });

  it('changes the task variable label if the payload is valid and the ID does exist', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'already-existing-id': {
        label: 'old label',
        value: 'old value',
      },
    });

    const validPayload: EditTaskVariableParamType = {
      variableId: 'already-existing-id',
      variableData: { label: 'new label' },
    };

    await expect(
      editTaskVariable({} as Event, validPayload)
    ).resolves.not.toThrow();

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      '{"already-existing-id":{"label":"new label","value":"old value"}}'
    );
  });

  it('changes the task variable value if the payload is valid and the ID does exist', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'already-existing-id': {
        label: 'old label',
        value: 'old value',
      },
    });

    const validPayload: EditTaskVariableParamType = {
      variableId: 'already-existing-id',
      variableData: { value: 'new value' },
    };

    await expect(
      editTaskVariable({} as Event, validPayload)
    ).resolves.not.toThrow();

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      '{"already-existing-id":{"label":"old label","value":"new value"}}'
    );
  });
});
