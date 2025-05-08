import React from 'react';

import { Placement as TooltipPlacementType } from 'renderer/components';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';

type PropsType = {
  label: React.ReactNode;
  value: React.ReactNode;
  tooltipContent?: string;
  tooltipPlacement?: TooltipPlacementType;
};

export function TaskItemStatCell({
  label,
  value,
  tooltipContent,
  tooltipPlacement,
}: PropsType) {
  const content = (
    <div className="flex flex-col items-start text-white">
      <div className="text-[12px] lg:text-sm md2:text-base">{label}</div>
      <div className="text-s lg:text-base md2:text-[1.25rem]">
        {value ?? 'N/A'}
      </div>
    </div>
  );
  return tooltipContent ? (
    <Popover tooltipContent={tooltipContent} theme={Theme.Dark}>
      {content}
    </Popover>
  ) : (
    content
  );
}
