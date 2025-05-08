/* eslint-disable @cspell/spellchecker */
import React from 'react';

import { GetTaskNodeInfoResponse } from 'models';
import { useMultipleKplTokenMetadata } from 'renderer/features/tokens/hooks/useMultipleKPLTokenMetadata';

import { BalancesCarousel } from '../AvailableBalanceInfoBox/AvailableBalanceInfoBox';
import { InfoBox } from '../InfoBox';

type PropsType = {
  totalStaked?: GetTaskNodeInfoResponse['totalStaked'];
};

export function StakeInfoBox({ totalStaked = {} }: PropsType) {
  const stakesToDisplay = Object.entries(totalStaked).filter(
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
    })
  );

  return (
    <InfoBox className="flex flex-col justify-center h-[100px] md2h:h-28 xl:p-4 overflow-hidden lgh:h-[120px]">
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-start gap-1 overflow-hidden w-full">
          <span className="text-sm text-green-2">Total Staked</span>

          <BalancesCarousel
            koiiBalance={totalStaked.KOII || 0}
            isLoadingKoiiBalance={isLoading}
            kplTokenItems={formattedStakesToDisplay as any}
          />
        </div>
      </div>
    </InfoBox>
  );
}
