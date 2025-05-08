import React from 'react';

import { DotsLoader } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import SparkleButton from 'renderer/components/ui/SparkleButton';
import { Theme } from 'renderer/types/common';

type PropsType = {
  isClaimingRewards?: boolean;
  onRewardClaimClick: () => void;
};

export function ClaimRewardAction({
  isClaimingRewards = false,
  onRewardClaimClick,
}: PropsType) {
  return isClaimingRewards ? (
    <div className="pt-4 pb-1">
      <DotsLoader />
    </div>
  ) : (
    <Popover
      theme={Theme.Light}
      tooltipContent="Click here to claim all your pending task rewards."
    >
      <SparkleButton
        text="Claim Rewards"
        buttonId="claim-rewards-button"
        onClick={onRewardClaimClick}
      />
    </Popover>
  );
}
