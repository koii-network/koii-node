import { Icon, InformationCircleLine } from '@_koii/koii-styleguide';
import React from 'react';

import { Button, Placement } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';

import { TaskName } from '../../../common';
import { OrcaTag } from '../../../OrcaTag';

type PropsType = {
  publicKey: string;
  taskName: string;
  infoIconClasses: string;
  handleToggleInfoAccordion: () => void;
  propsManagingMainTooltipState: any;
  tooltipRightPlacement?: Placement;
  infoButtonTooltipContent: string;
  isUsingOrca?: boolean;
};

export function TaskInfoCell({
  taskName,
  infoIconClasses,
  handleToggleInfoAccordion,
  propsManagingMainTooltipState,
  infoButtonTooltipContent,
  isUsingOrca = true,
}: PropsType) {
  return (
    <div className="flex items-center gap-2 justify-self-start">
      <Popover theme={Theme.Dark} tooltipContent={infoButtonTooltipContent}>
        <div
          {...propsManagingMainTooltipState}
          className="flex flex-col items-center justify-start w-10"
        >
          <Button
            onClick={handleToggleInfoAccordion}
            icon={
              <Icon
                source={InformationCircleLine}
                size={32}
                className={infoIconClasses}
              />
            }
            onlyIcon
          />
        </div>
      </Popover>

      <Popover theme={Theme.Dark} tooltipContent={taskName}>
        <TaskName taskName={taskName} />
        {isUsingOrca && <OrcaTag />}
      </Popover>
    </div>
  );
}
