import React from 'react';

import CloseIcon from 'assets/svgs/cross-icon.svg';
import SearchIcon from 'assets/svgs/search.svg';
import UpdateIcon from 'assets/svgs/update-icon.svg';
import { Button, Placement, Tooltip } from 'renderer/components/ui';

interface PrivateUpgradeWarningProps {
  onUpgrade: () => void;
  onReview: () => void;
  onAcknowledge: () => void;
  isFirstRowInTable: boolean;
  isCoolingDown: boolean;
}

export function PrivateUpgradeWarning({
  onUpgrade,
  onReview,
  onAcknowledge,
  isFirstRowInTable,
  isCoolingDown,
}: PrivateUpgradeWarningProps) {
  const upgradeNowButton = (
    <Button
      onClick={onUpgrade}
      icon={<UpdateIcon className="h-6 w-6 stroke-2" />}
      label="Upgrade Now"
      disabled={isCoolingDown}
      className="text-finnieBlue h-9 w-[162px] bg-finnieOrange"
    />
  );
  const tooltipPlacement: Placement = `${
    isFirstRowInTable ? 'bottom' : 'top'
  }-left`;
  const toltipContent = isCoolingDown
    ? 'The upgrade will be available after 3 rounds.'
    : 'Running tasks that are not vetted by our team could be risky.';

  return (
    <>
      <div className="col-span-2 flex flex-col text-base justify-center mt-3">
        <div>This task has not been reviewed by our team.</div>
        <div className="text-finnieOrange">Proceed with caution.</div>
      </div>
      <div className="ml-[50%] col-span-1">
        <Button
          onClick={onReview}
          icon={<SearchIcon />}
          label="Review"
          className="border-2 border-white text-white h-9 w-[115px] bg-transparent rounded-md"
        />
      </div>
      <div className="col-span-3 ml-10">
        <Tooltip tooltipContent={toltipContent} placement={tooltipPlacement}>
          {upgradeNowButton}
        </Tooltip>
      </div>
      <CloseIcon onClick={onAcknowledge} className="cursor-pointer" />
    </>
  );
}
