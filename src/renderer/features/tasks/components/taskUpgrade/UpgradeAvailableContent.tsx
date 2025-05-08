import React from 'react';

import CloseIcon from 'assets/svgs/cross-icon.svg';
import SearchIcon from 'assets/svgs/search.svg';
import UpdateIcon from 'assets/svgs/update-icon.svg';
import { Button, Placement, Tooltip } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';

interface UpgradeAvailableContentProps {
  onUpgrade: () => void;
  onReview: () => void;
  onAcknowledge: () => void;
  isFirstRowInTable: boolean;
  isCoolingDown: boolean;
  isPrivateUpgrade: boolean;
}

export function UpgradeAvailableContent({
  onUpgrade,
  onReview,
  onAcknowledge,
  isFirstRowInTable,
  isCoolingDown,
  isPrivateUpgrade,
}: UpgradeAvailableContentProps) {
  const upgradeNowClasses = `text-finnieBlue h-9 w-[162px] bg-white ${
    isPrivateUpgrade ? 'bg-finnieOrange' : ''
  }`;
  const upgradeNowButton = (
    <Button
      onClick={onUpgrade}
      icon={<UpdateIcon className="w-6 h-6 stroke-2" />}
      label="Upgrade Now"
      disabled={isCoolingDown}
      className={upgradeNowClasses}
    />
  );
  const coolingDownTooltipPlacement: Placement = `${
    isFirstRowInTable ? 'bottom' : 'top'
  }-left`;
  const tooltipContent = isCoolingDown
    ? 'The upgrade will be available after 3 rounds.'
    : 'Running tasks that are not vetted by our team could be risky.';
  const reviewTooltipContent = "Review what's new in this update.";

  return (
    <>
      <div className="col-span-1 ml-[50%]">
        <div />
        <Popover tooltipContent={reviewTooltipContent}>
          <Button
            onClick={onReview}
            icon={<SearchIcon />}
            label="Review"
            className="border-2 border-white text-white h-9 w-[115px] bg-transparent rounded-md"
          />
        </Popover>
      </div>

      <div className="col-span-3 ml-10">
        {isCoolingDown || isPrivateUpgrade ? (
          <Tooltip
            tooltipContent={tooltipContent}
            placement={coolingDownTooltipPlacement}
          >
            {upgradeNowButton}
          </Tooltip>
        ) : (
          upgradeNowButton
        )}
      </div>
      <div className="col-span-1">
        <CloseIcon onClick={onAcknowledge} className="cursor-pointer" />
      </div>
    </>
  );
}
