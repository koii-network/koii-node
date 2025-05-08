import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { Task } from 'renderer/types';

import { PrivateTaskInput } from './PrivateTaskInput';

describe('<PrivateTaskInput />', () => {
  let onCloseMock: () => void;
  let onChangeMock: (e: React.ChangeEvent<HTMLInputElement>) => void;
  const task = { id: '1', name: 'Task 1' /* other task properties */ };
  const taskPubkey = 'TaskPubKeyExample';

  beforeEach(() => {
    onCloseMock = jest.fn();
    onChangeMock = jest.fn();
  });

  it('renders loading spinner when loading', () => {
    render(
      <PrivateTaskInput
        onChange={onChangeMock}
        taskPubkey={taskPubkey}
        loadingTask
        task={null}
        onClose={onCloseMock}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders success icon when task is loaded and not started', () => {
    render(
      <PrivateTaskInput
        onChange={onChangeMock}
        taskPubkey={taskPubkey}
        loadingTask={false}
        task={task as unknown as Task}
        onClose={onCloseMock}
        alreadyStarted={false}
      />
    );
    const icon = screen.getByLabelText('Check Success');
    expect(icon).toBeInTheDocument();
  });

  it('calls onChange when input is changed', () => {
    render(
      <PrivateTaskInput
        onChange={onChangeMock}
        taskPubkey={taskPubkey}
        loadingTask={false}
        task={null}
        onClose={onCloseMock}
      />
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NewTaskPubKey' } });
    expect(onChangeMock).toHaveBeenCalled();
  });
});
