import React from 'react';

import Hourglass from 'assets/svgs/HourglassIcon.svg';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useAverageSlotTime } from 'renderer/features/common';
import { useTaskRoundTime } from 'renderer/features/tasks/hooks/useRoundTime';
import { Theme } from 'renderer/types/common';
import { formatRoundTimeWithFullUnit } from 'renderer/utils';

export function RoundTime({ roundTimeInMs }: { roundTimeInMs: number }) {
  const { data: averageSlotTime } = useAverageSlotTime();
  const parsedRoundTime = useTaskRoundTime({
    roundTimeInMs,
    averageSlotTime,
  });

  const fullTime =
    parsedRoundTime && formatRoundTimeWithFullUnit(parsedRoundTime);

  if (!parsedRoundTime) {
    return <span>N/A</span>;
  }

  return (
    <Popover
      tooltipContent={
        <>
          Each round will include the full flow of the task: submission phase,
          audit phase, and distribution phase. <br />
          You will receive rewards for each round where your node makes a
          successful submission.
          <br /> <br /> The round time of this task is {fullTime}.
          <br /> <br />
          <em>
            Note: Rewards are issued with a slight delay to allow for the
            auditing of submissions, so you will receive each reward 2 rounds
            after each successful submission.
          </em>
        </>
      }
      theme={Theme.Dark}
    >
      {' '}
      <div className="flex flex-col justify-between w-full">
        <div className="text-[10px]">Round time</div>
        <div className="text-[12px] mx-auto w-fit flex">
          <Hourglass className="w-5 h-5 xl:h-6 xl:w-6" />{' '}
          {`${Math.ceil(parsedRoundTime.value)} ${parsedRoundTime.unit}`}
        </div>
      </div>
    </Popover>
  );
}
