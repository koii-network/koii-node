import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { formatNumber } from 'renderer/features/tasks/utils';
import { Theme } from 'renderer/types/common';

const CURRENCIES = {
  KOII: 'KOII',
  ETH: 'ETH',
  USDC: 'USDC',
  USDT: 'USDT',
  BTC: 'BTC',
} as const;

type CurrencyType = keyof typeof CURRENCIES;

type PropsType = {
  currency: CurrencyType | string;
  amount?: number;
  precision?: number;
  tooltipContent?: React.ReactNode;
  hideSymbol?: boolean;
};

export function CurrencyDisplay({
  amount,
  currency = 'KOII',
  precision,
  tooltipContent,
  hideSymbol,
}: PropsType) {
  if (amount === undefined) {
    return null;
  }

  const content = `${
    Number.isInteger(amount)
      ? amount.toString()
      : precision
      ? amount.toFixed(precision)
      : formatNumber(amount, false)
  } ${hideSymbol ? '' : currency}`;

  return tooltipContent ? (
    <Popover theme={Theme.Dark} tooltipContent={tooltipContent}>
      {content}
    </Popover>
  ) : (
    <span>{content}</span>
  );
}
