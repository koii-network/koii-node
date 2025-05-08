import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';

import { NOT_AVAILABLE_PLACEHOLDER } from '../constants';

import { type TaskStat } from './TaskStats';

type PropsType = TaskStat;

export function StatBox({ label, value, fullValue }: PropsType) {
  const getContent = () => {
    if (!value) {
      return NOT_AVAILABLE_PLACEHOLDER;
    }

    if (fullValue && value) {
      return (
        <Popover theme={Theme.Light} tooltipContent={fullValue}>
          {value}
        </Popover>
      );
    }

    return value;
  };

  const content = getContent();

  return (
    <div className="flex flex-col p-2 2xl:p-4 text-white rounded-lg bg-finnieBlue-light-transparent w-[15%] overflow-hidden">
      <div className="mb-1 text-base">{label}</div>
      <div className="text-2xl xl:text-3xl">{content}</div>
    </div>
  );
}
