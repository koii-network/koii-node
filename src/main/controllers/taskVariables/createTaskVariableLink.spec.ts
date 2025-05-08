import { Request, Response } from 'express';
import { namespaceInstance } from 'main/node/helpers/Namespace';

import { PersistentStoreKeys } from '../types';

import { createTaskVariable } from './createTaskVariableLink';
import { getStoredTaskVariables } from './getStoredTaskVariables';

// Mock UUID to have consistent IDs in tests
jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}));

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeSet: jest.fn(),
  },
}));

jest.mock('./getStoredTaskVariables', () => ({
  getStoredTaskVariables: jest.fn(),
}));

const getStoredTaskVariablesMock = getStoredTaskVariables as jest.Mock;
const storeSetMock = namespaceInstance.storeSet as jest.Mock;

describe('createTaskVariable', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
  });

  it('creates a new task variable successfully', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});
    mockRequest = {
      body: {
        label: 'New Variable',
        value: 'test value',
      },
    };

    await createTaskVariable(mockRequest as Request, mockResponse as Response);

    expect(storeSetMock).toHaveBeenCalledWith(
      PersistentStoreKeys.TaskVariables,
      JSON.stringify({
        'mocked-uuid': {
          label: 'New Variable',
          value: 'test value',
        },
      })
    );
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      id: 'mocked-uuid',
      taskVariable: {
        label: 'New Variable',
        value: 'test value',
      },
    });
  });

  it('returns 400 if label is missing', async () => {
    mockRequest = {
      body: {
        value: 'test value',
      },
    };

    await createTaskVariable(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Missing required fields: label and value are required',
    });
  });

  it('returns 400 if value is missing', async () => {
    mockRequest = {
      body: {
        label: 'New Variable',
      },
    };

    await createTaskVariable(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Missing required fields: label and value are required',
    });
  });

  it('returns 400 if label already exists', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({
      'existing-id': {
        label: 'New Variable',
        value: 'existing value',
      },
    });

    mockRequest = {
      body: {
        label: 'New Variable',
        value: 'test value',
      },
    };

    await createTaskVariable(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Task variable with label "New Variable" already exists',
    });
  });

  it('returns 500 if storage operation fails', async () => {
    getStoredTaskVariablesMock.mockResolvedValue({});
    storeSetMock.mockRejectedValue(new Error('Storage error'));

    mockRequest = {
      body: {
        label: 'New Variable',
        value: 'test value',
      },
    };

    await createTaskVariable(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to create task variable',
    });
  });
});
