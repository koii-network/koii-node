import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { StartPauseTaskButton } from './StartPauseTaskButton';

type handlerType = () => void;

describe('<StartPauseTaskButton />', () => {
  let onStartTaskMock: handlerType;
  let onStopTaskMock: handlerType;
  const tooltipContent = 'Test Tooltip Content';

  beforeEach(() => {
    onStartTaskMock = jest.fn();
    onStopTaskMock = jest.fn();
  });

  it('renders Play icon and calls onStartTask when clicked', () => {
    render(
      <StartPauseTaskButton
        isRunning={false}
        isTaskValidToRun
        onStartTask={onStartTaskMock}
        onStopTask={onStopTaskMock}
        tooltipContent={tooltipContent}
      />
    );

    const button = screen.getByRole('button');
    const icon = screen.getByLabelText('Start Task');

    expect(icon).toBeInTheDocument();
    fireEvent.click(button);

    expect(onStartTaskMock).toHaveBeenCalled();
    expect(onStopTaskMock).not.toHaveBeenCalled();
  });

  it('renders Pause icon and calls onStopTask when clicked', () => {
    render(
      <StartPauseTaskButton
        isRunning
        isTaskValidToRun
        onStartTask={onStartTaskMock}
        onStopTask={onStopTaskMock}
        tooltipContent={tooltipContent}
      />
    );

    const button = screen.getByRole('button');
    const icon = screen.getByLabelText('Pause Task');

    expect(icon).toBeInTheDocument();
    fireEvent.click(button);

    expect(onStopTaskMock).toHaveBeenCalled();
    expect(onStartTaskMock).not.toHaveBeenCalled();
  });

  it('disables button when isTaskValidToRun is false', () => {
    render(
      <StartPauseTaskButton
        isRunning={false}
        isTaskValidToRun={false}
        onStartTask={onStartTaskMock}
        onStopTask={onStopTaskMock}
        tooltipContent={tooltipContent}
      />
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
  });
});
