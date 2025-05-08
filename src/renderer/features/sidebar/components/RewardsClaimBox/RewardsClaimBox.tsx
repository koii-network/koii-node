import React from 'react';

import { GetTaskNodeInfoResponse } from 'models';
import { useMultipleKplTokenMetadata } from 'renderer/features/tokens/hooks/useMultipleKPLTokenMetadata';

import { BalancesCarousel } from '../AvailableBalanceInfoBox/AvailableBalanceInfoBox';
import { InfoBox } from '../InfoBox';

import { ClaimRewardAction } from './ClaimRewardAction';

type PropsType = {
  onRewardClaimClick: () => void;
  rewardClaimable?: boolean;
  rewardsAmount?: GetTaskNodeInfoResponse['pendingRewards'];
  isClaimingRewards?: boolean;
};

export function RewardsClaimBox({
  rewardsAmount = {},
  rewardClaimable = false,
  onRewardClaimClick,
  isClaimingRewards,
}: PropsType) {
  const stakesToDisplay = Object.entries(rewardsAmount).filter(
    ([mintAddress, value]) => value > 0 && mintAddress !== 'KOII'
  );
  const { data: kplList, isLoading } = useMultipleKplTokenMetadata(
    stakesToDisplay.map((e) => e[0])
  );

  const formattedStakesToDisplay = stakesToDisplay.map(
    ([mintAddress, value], index) => ({
      symbol: kplList?.[index]?.symbol || 'KOII',
      balance: value,
      mintAddress,
      logoURI: kplList?.[index]?.logoURI,
      decimals: kplList?.[index]?.decimals || 9,
    })
  );

  return (
    <InfoBox className="flex flex-col items-center p-2 xl:px-4 lgh:py-4 lgh:gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start w-full">
          <span className="text-sm text-green-2 pb-1">Rewards</span>
          <BalancesCarousel
            koiiBalance={rewardsAmount.KOII || 0}
            isLoadingKoiiBalance={isLoading}
            kplTokenItems={formattedStakesToDisplay as any}
          />
        </div>
      </div>
      <div className="h-13 flex items-center justify-center">
        {rewardClaimable ? (
          <ClaimRewardAction
            isClaimingRewards={isClaimingRewards}
            onRewardClaimClick={onRewardClaimClick}
          />
        ) : (
          <span className="text-sm mt-4">Add a task to earn</span>
        )}
      </div>
    </InfoBox>
  );
}
