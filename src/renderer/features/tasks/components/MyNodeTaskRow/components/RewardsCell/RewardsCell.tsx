import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';

type PropsType = {
  nextReward: React.ReactNode;
  pendingRewards: React.ReactNode;
  allTimeRewards: React.ReactNode;
};

export function RewardsCell({
  nextReward,
  pendingRewards,
  allTimeRewards,
}: PropsType) {
  return (
    <div className="flex gap-1 justify-between bg-finnieBlue-light-transparent w-[220px] h-[56px] xl:w-[230px] rounded-lg p-2 px-4 cursor-default">
      <Popover
        theme={Theme.Dark}
        tooltipContent="This is an approximate value, based on the latest rewards issued by the task."
      >
        <div className="flex flex-col justify-between items-center">
          <div className="text-[10px]">Next Reward</div>
          <div className="text-[12px] mx-auto w-fit flex xl:mt-[1.5px]">
            {nextReward}
          </div>
        </div>
      </Popover>
      <Popover
        theme={Theme.Dark}
        tooltipContent="Rewards pending to be claimed."
      >
        <div className="flex flex-col justify-between">
          <div className="text-[10px]">Pending</div>
          <div className="text-[12px] mx-auto w-fit">{pendingRewards}</div>
        </div>
      </Popover>
      <Popover
        theme={Theme.Dark}
        tooltipContent={
          <>
            Total rewards earned from running this task.
            <br /> <br />
            <em>
              Note: This value also includes any tokens you&apos;ve
              <br />
              {/* eslint-disable-next-line @cspell/spellchecker */}
              unstaked, as they are credited back as rewards.
            </em>
          </>
        }
      >
        <div className="flex flex-col justify-between">
          <div className="text-[10px]">All time</div>
          <div className="text-[12px] mx-auto w-fit xl:mt-px">
            {allTimeRewards}
          </div>
        </div>
      </Popover>
    </div>
  );
}
