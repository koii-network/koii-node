import { namespaceInstance } from 'main/node/helpers/Namespace';

import { getStoredTaskVariables } from './getStoredTaskVariables';

jest.mock('main/node/helpers/Namespace', () => {
  return {
    namespaceInstance: {
      storeGet: jest.fn(),
    },
  };
});

const namespaceStoreGetMock = namespaceInstance.storeGet as jest.Mock;

describe('getStoredTaskVariables', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return an empty object if the task variables are not set', async () => {
    namespaceStoreGetMock.mockReturnValueOnce(undefined);

    const result = await getStoredTaskVariables();

    expect(result).toEqual({});
  });

  it('should return the task variables if they are set', async () => {
    namespaceStoreGetMock.mockReturnValueOnce('{"foo": "bar"}');

    const result = await getStoredTaskVariables();

    expect(result).toEqual({ foo: 'bar' });
  });

  it('should return an empty object if the task variables are invalid', async () => {
    namespaceStoreGetMock.mockReturnValueOnce('{"foo": "bar"');

    const result = await getStoredTaskVariables();

    expect(result).toEqual({});
  });
});
