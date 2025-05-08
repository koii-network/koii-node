import React from 'react';
import CountUp from 'react-countup';

import KoiiTokenLogo from 'assets/svgs/koii-token-logo.svg';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { usePrevious } from 'renderer/features/common';
import { Theme } from 'renderer/types/common';
import { getFullKoiiFromRoe, getKoiiFromRoe } from 'utils';

import { countDecimals } from '../../utils';

export const TOO_SMALL_AMOUNT_PLACEHOLDER = '< 0.001';

type PropsType = {
  value: number;
  ticker?: string;
  logoURI?: string;
  decimals?: number;
};

export function CountKoii({
  value,
  ticker = 'KOII',
  logoURI,
  decimals = 9,
}: PropsType) {
  const roundedValue =
    ticker === 'KOII' ? getKoiiFromRoe(value) : value / 10 ** decimals;
  const fullValue =
    ticker === 'KOII' ? getFullKoiiFromRoe(value) : value / 10 ** decimals;
  const previousValue = usePrevious(roundedValue);
  const decimalsAmount = countDecimals(fullValue);
  const isVerySmallAmount = fullValue < 0.001 && fullValue > 0;
  const trailingDecimals = roundedValue < 100000 ? 2 : 0;

  const formatFullValue = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.max(decimalsAmount, 3),
      useGrouping: true,
    });
  };

  return (
    <Popover tooltipContent={formatFullValue(fullValue)} theme={Theme.Light}>
      <div className="flex flex-col items-start gap-1 cursor-auto">
        {isVerySmallAmount ? (
          <span>{TOO_SMALL_AMOUNT_PLACEHOLDER}</span>
        ) : (
          <CountUp
            decimals={trailingDecimals}
            start={previousValue}
            end={roundedValue}
            duration={0.5}
            data-testid="count-koii"
          />
        )}
        <div className="flex gap-1 items-center">
          <p>{ticker}</p>
          {!!logoURI && !!ticker && (
            <img src={logoURI} alt={ticker} className="w-5 h-5 rounded-full" />
          )}
          {ticker === 'KOII' && (
            <KoiiTokenLogo className="w-[21px] h-[21px] rounded-full" />
          )}
        </div>
      </div>
    </Popover>
  );
}
