import { randomUUID } from 'crypto';

import { namespaceInstance } from 'main/node/helpers/Namespace';

import { PersistentStoreKeys } from '../types';

import { getStoredTaskVariables } from './getStoredTaskVariables';
import { storeTaskVariable } from './storeTaskVariable';

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

jest.mock('crypto', () => {
  return {
    randomUUID: jest.fn(),
  };
});

const getStoredTaskVariablesMock = getStoredTaskVariables as jest.Mock;
const randomUUIDMock = randomUUID as jest.Mock;

describe('storeTaskVariable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if the payload is not valid', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});

    const invalidPayload = {};

    await expect(
      storeTaskVariable({} as Event, invalidPayload as unknown as never)
    ).rejects.toThrow();
  });

  it('throws an error if the label already exists', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'some-id': { label: 'existing label', value: 'some value' },
    });

    const existingLabelPayload = {
      label: 'existing label',
      value: 'some value',
    };

    await expect(
      storeTaskVariable({} as Event, existingLabelPayload)
    ).rejects.toThrow();
  });

  it('stores the task variable if the payload is valid and the label does not exist', async () => {
    const MOCKED_ID = 'some-id';

    getStoredTaskVariablesMock.mockResolvedValue({
      'already-existing-id': {
        label: 'existing label',
        value: 'some existing value',
      },
    });

    randomUUIDMock.mockReturnValue(MOCKED_ID);

    const validPayload = { label: 'new label', value: 'some new value' };

    await expect(
      storeTaskVariable({} as Event, validPayload)
    ).resolves.not.toThrow();

    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      '{"already-existing-id":{"label":"existing label","value":"some existing value"},"some-id":{"label":"new label","value":"some new value"}}'
    );
  });
});
