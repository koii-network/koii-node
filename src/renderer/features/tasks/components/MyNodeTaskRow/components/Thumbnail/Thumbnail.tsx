import React, { KeyboardEventHandler, MouseEventHandler } from 'react';

import GenericThumbnail from 'assets/svgs/generic-task-thumbnail.png';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';

interface Props {
  taskName: string;
  tooltipContent: string;
  onKeyDown: KeyboardEventHandler;
  onClick: MouseEventHandler;
  src: string;
  isBonusTask?: boolean;
  isBountyEmpty?: boolean;
}

export function Thumbnail({
  taskName,
  tooltipContent,
  onKeyDown,
  onClick,
  src,
  isBonusTask,
  isBountyEmpty,
}: Props) {
  return (
    <div className="flex flex-row gap-x-4 justify-self-start">
      <Popover tooltipContent={tooltipContent} theme={Theme.Dark}>
        <div className="relative w-[10.25rem] h-auto md2:w-[12rem] transition-all duration-300 ease-in-out rounded-md">
          <img
            src={src}
            onError={(e) => {
              e.currentTarget.src = GenericThumbnail;
            }}
            alt="Task Thumbnail"
            className={`max-h-[62px] md2:max-h-[72px] mx-auto transition-all duration-300 ease-in-out rounded-md ${
              isBonusTask && isBountyEmpty ? 'grayscale' : ''
            }`}
          />
          <button
            onKeyDown={onKeyDown}
            tabIndex={0}
            onClick={onClick}
            className="absolute rounded-md inset-0 flex items-end justify-center bg-gradient-to-t from-theme-shade via-theme-shade/70 to-transparent group-hover/row:opacity-100 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out"
          >
            <span
              onKeyDown={onKeyDown}
              tabIndex={0}
              role="button"
              onClick={onClick}
              className="text-white text-[13px]"
            >
              {taskName}
            </span>
          </button>
        </div>
      </Popover>
    </div>
  );
}
