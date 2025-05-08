import { Icon, PauseFill, PlayFill } from '@_koii/koii-styleguide';
import React, { ReactNode } from 'react';

import { Button, Tooltip } from 'renderer/components/ui';

type PropsType = {
  isRunning: boolean;
  tooltipContent: ReactNode;
  isTaskValidToRun: boolean;
  onStartTask: () => void;
  onStopTask: () => void;
  disabled?: boolean;
};

export function StartPauseTaskButton({
  isRunning,
  isTaskValidToRun,
  onStopTask,
  onStartTask,
  tooltipContent,
  disabled,
}: PropsType) {
  return (
    <Tooltip placement="top-left" tooltipContent={tooltipContent}>
      <Button
        onlyIcon
        icon={
          <Icon
            source={isRunning ? PauseFill : PlayFill}
            size={18}
            className={`w-full flex my-4 ${
              isTaskValidToRun || isRunning
                ? 'text-finnieTeal'
                : 'text-gray-500 cursor-not-allowed'
            }`}
            aria-label={isRunning ? 'Pause Task' : 'Start Task'}
          />
        }
        onClick={isRunning ? onStopTask : onStartTask}
        disabled={!isTaskValidToRun || disabled}
      />
    </Tooltip>
  );
}
