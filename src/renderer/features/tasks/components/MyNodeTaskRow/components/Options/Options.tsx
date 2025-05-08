import { Icon } from '@_koii/koii-styleguide';
import React, { forwardRef } from 'react';

import DotsSvg from 'assets/svgs/options.svg';
import { Button } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Task } from 'renderer/types';
import { Theme } from 'renderer/types/common';

import { OptionsDropdown } from './OptionsDropdown';

type PropsType = {
  task: Task;
  optionsButtonClasses: string;
  shouldDisplayActions: boolean;
  optionsDropdownIsInverted: boolean;
  canUnstake?: boolean;
  handleToggleOptionsDropdown: () => void;
  showAddStakeModal: () => void;
  showUnstakeModal: () => void;
  openTaskLogs: () => void;
  handleToggleTask: () => void;
  handleTaskArchive: (isArchiving: boolean) => void;
  handleRestartTask: () => void;
  isRestartingTask: boolean;
};

export const Options = forwardRef<HTMLDivElement, PropsType>(
  (
    {
      task,
      optionsDropdownIsInverted,
      handleToggleOptionsDropdown,
      optionsButtonClasses,
      shouldDisplayActions,
      showAddStakeModal,
      showUnstakeModal,
      openTaskLogs,
      handleToggleTask,
      handleTaskArchive,
      canUnstake,
      handleRestartTask,
      isRestartingTask,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative flex flex-row items-center gap-4">
        <Popover tooltipContent="More options" theme={Theme.Dark}>
          <Button
            onClick={handleToggleOptionsDropdown}
            onlyIcon
            icon={<Icon source={DotsSvg} className="w-6 h-6 text-white" />}
            className={optionsButtonClasses}
          />
          <OptionsDropdown
            isOpen={shouldDisplayActions}
            task={task}
            isInverted={optionsDropdownIsInverted}
            canUnstake={canUnstake}
            addStake={showAddStakeModal}
            unstake={showUnstakeModal}
            openLogs={openTaskLogs}
            runOrStopTask={handleToggleTask}
            onTaskArchive={handleTaskArchive}
            handleRestartTask={handleRestartTask}
            isRestartingTask={isRestartingTask}
          />
        </Popover>
      </div>
    );
  }
);

Options.displayName = 'Options';
