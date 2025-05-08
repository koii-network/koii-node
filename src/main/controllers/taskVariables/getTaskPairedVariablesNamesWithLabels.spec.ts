import {
  GetStoredPairedTaskVariablesReturnType,
  GetTaskPairedVariablesNamesWithLabelsParamType,
  TaskVariablesReturnType,
} from 'models';

import { validateTask } from '../getTaskInfo';

import { getStoredPairedTaskVariables } from './getStoredPairedTaskVariables';
import { getStoredTaskVariables } from './getStoredTaskVariables';
import { getTaskPairedVariablesNamesWithLabels } from './getTaskPairedVariablesNamesWithLabels';

jest.mock('../getTaskInfo', () => {
  return {
    validateTask: jest.fn(),
  };
});
jest.mock('./getStoredPairedTaskVariables', () => {
  return {
    getStoredPairedTaskVariables: jest.fn(),
  };
});

jest.mock('./getStoredTaskVariables', () => {
  return {
    getStoredTaskVariables: jest.fn(),
  };
});

const k2PublicKeyExample = '7Ds4GdPPGb2DNEwT6is31i1KkR2WqusttB55T4QgGUvg';

const validateTaskMock = validateTask as jest.Mock;

const getStoredPairedTaskVariablesMock =
  getStoredPairedTaskVariables as jest.Mock<
    Promise<GetStoredPairedTaskVariablesReturnType>
  >;

const getStoredTaskVariablesMock = getStoredTaskVariables as jest.Mock<
  Promise<TaskVariablesReturnType>
>;

describe('getTaskPairedVariablesNamesWithLabels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('throws an error if the payload is not valid - missing taskAccountPubKey', async () => {
    const invalidPayload = {};

    await expect(
      getTaskPairedVariablesNamesWithLabels(
        {} as Event,
        invalidPayload as GetTaskPairedVariablesNamesWithLabelsParamType
      )
    ).rejects.toThrow(/payload is not valid/i);
  });

  it('throws an error if paired variable is not stored', async () => {
    validateTaskMock.mockResolvedValue({});

    const validPayload: GetTaskPairedVariablesNamesWithLabelsParamType = {
      taskAccountPubKey: k2PublicKeyExample,
    };

    getStoredPairedTaskVariablesMock.mockResolvedValue({
      [k2PublicKeyExample]: { name1: 'id1' },
    });

    getStoredTaskVariablesMock.mockResolvedValue({});

    await expect(
      getTaskPairedVariablesNamesWithLabels({} as Event, validPayload)
    ).rejects.toThrow(/No paired Task variable stored/i);
  });

  it('returns proper map of Task Variable Name to Variable Label', async () => {
    validateTaskMock.mockResolvedValue({});

    const validPayload: GetTaskPairedVariablesNamesWithLabelsParamType = {
      taskAccountPubKey: k2PublicKeyExample,
    };

    const varId = 'id1';
    const variableName = 'name1';

    getStoredPairedTaskVariablesMock.mockResolvedValue({
      [k2PublicKeyExample]: { [variableName]: varId },
    });

    getStoredTaskVariablesMock.mockResolvedValue({
      [varId]: { label: 'label', value: 'value' },
    });

    expect(
      await getTaskPairedVariablesNamesWithLabels({} as Event, validPayload)
    ).toEqual([{ name: variableName, label: 'label', variableId: 'id1' }]);
  });
});
