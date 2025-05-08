import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QueryObserverResult, useQuery } from 'react-query';

import { TaskVariableDataWithId } from 'models/api';
import { useStartedTasksPubKeys } from 'renderer/features/tasks';

import { InspectTaskVariable } from './InspectTaskVariable';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('react-query', () => ({
  ...jest.requireActual<typeof useQuery>('react-query'),
  useQuery: jest.fn(),
}));

jest.mock('renderer/features/tasks');

describe('InspectTaskVariable', () => {
  const startedTasksPubKeys: string[] = ['task1', 'task2', 'task3'];
  const tasksPairedWithVariable = [
    { publicKey: 'task1', data: { taskName: 'Task Name 1' } },
    { publicKey: 'task2', data: { taskName: 'Task Name 2' } },
    { publicKey: 'task3', data: { taskName: 'Task Name 3' } },
  ];

  beforeEach(() => {
    (useStartedTasksPubKeys as jest.Mock).mockReturnValue({
      data: startedTasksPubKeys,
      isLoading: false,
    });
    (useQuery as jest.Mock).mockReturnValue({
      data: tasksPairedWithVariable,
      isLoading: false,
    } as QueryObserverResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const taskVariable: TaskVariableDataWithId = {
      label: 'test label',
      value: 'test value',
      id: 'test id',
    };

    render(
      <InspectTaskVariable taskVariable={taskVariable} onRemove={jest.fn} />
    );

    expect(screen.getByText('View Task Extension Info')).toBeInTheDocument();
    expect(screen.getByText('TOOL LABEL')).toBeInTheDocument();
    expect(screen.getByText('TOOL KEY INPUT')).toBeInTheDocument();
  });

  it('calls navigate and modal.remove when "See all Tasks" is clicked', () => {
    const taskVariable: TaskVariableDataWithId = {
      label: 'test label',
      value: 'test value',
      id: 'test id',
    };
    const removeMock = jest.fn();

    render(
      <InspectTaskVariable taskVariable={taskVariable} onRemove={removeMock} />
    );

    fireEvent.click(screen.getByText('See all Tasks'));

    expect(mockedUsedNavigate).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    const taskVariable: TaskVariableDataWithId = {
      label: 'test label',
      value: 'test value',
      id: 'test id',
    };

    (useStartedTasksPubKeys as jest.Mock).mockReturnValueOnce({
      data: startedTasksPubKeys,
      isLoading: true,
    });

    render(
      <InspectTaskVariable taskVariable={taskVariable} onRemove={jest.fn} />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays tasks using this tool correctly', () => {
    const taskVariable: TaskVariableDataWithId = {
      label: 'test label',
      value: 'test value',
      id: 'task1',
    };

    render(
      <InspectTaskVariable taskVariable={taskVariable} onRemove={jest.fn} />
    );

    expect(screen.getByText('TASKS USING THIS TOOL')).toBeInTheDocument();
    expect(screen.getByText('Task Name 1')).toBeInTheDocument();
    expect(screen.getByText('Task Name 2')).toBeInTheDocument();
    expect(screen.getByText('Task Name 3')).toBeInTheDocument();
  });
});
