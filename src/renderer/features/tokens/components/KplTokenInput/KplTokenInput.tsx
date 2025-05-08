import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React, { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { getMainUnitFromDenomination } from 'utils/currencyConversion';

import { TokenItemType } from '../../types';

import { TokenLogoDisplay } from './TokenLogoDisplay';

type PropsType = {
  disabled?: boolean;
  onInputChange: (value: number | undefined, token: TokenItemType) => void;
  value?: number;
  className?: string;
  kplTokenItems: TokenItemType[];
  label?: string;
  defaultToken?: TokenItemType;
  defaultAmount?: number;
  koiiTokenBalance?: number;
  disableKoiiToken?: boolean;
};

const koiiTokenItem: TokenItemType = {
  name: 'Koii',
  symbol: 'KOII',
  balance: 0,
  logoURI: 'assets/svgs/koii-token-logo.svg',
  mint: '',
  decimals: 9,
  associateTokenAddress: '',
};

export function KplTokenInput({
  disabled,
  onInputChange,
  value,
  className,
  kplTokenItems,
  label = 'Amount to send',
  defaultToken,
  defaultAmount = 0,
  koiiTokenBalance,
  disableKoiiToken = false,
}: PropsType) {
  const defaultTokenToTransfer = defaultToken || koiiTokenItem;
  const [tokenToTransfer, setTokenToTransfer] = useState<TokenItemType>(
    defaultTokenToTransfer
  );
  const [amount, setAmount] = useState<number | undefined>(defaultAmount);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (defaultToken && (!disableKoiiToken || defaultToken.symbol !== 'KOII')) {
      setTokenToTransfer(defaultToken);
    } else if (disableKoiiToken && tokenToTransfer.symbol === 'KOII') {
      const firstNonKoiiToken = kplTokenItems.find(
        (token) => token.symbol !== 'KOII'
      );
      if (firstNonKoiiToken) {
        setTokenToTransfer(firstNonKoiiToken);
      }
    }
  }, [defaultToken, disableKoiiToken, kplTokenItems]);

  useEffect(() => {
    if (defaultAmount !== undefined) {
      setAmount(defaultAmount);
    }
  }, [defaultAmount]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const newValue = e.target.value === '' ? undefined : Number(e.target.value);
    setAmount(newValue);
    onInputChange(newValue, tokenToTransfer);
  };

  const handleTokenChange = (token: TokenItemType) => {
    setTokenToTransfer(token);
    onInputChange(amount, token);
  };

  const wrapperDivClasses = twMerge(
    'flex w-[246px] items-center justify-center pl-4 py-2 space-x-1 text-white duration-500 rounded-md bg-finnieBlue-light-tertiary transition-width',
    className
  );

  const tokensDropdownItems = useMemo(() => {
    let filteredTokens = kplTokenItems.filter(
      (token) => token !== tokenToTransfer
    );
    if (disableKoiiToken) {
      filteredTokens = filteredTokens.filter(
        (token) => token.symbol !== 'KOII'
      );
    }
    return filteredTokens;
  }, [kplTokenItems, tokenToTransfer, disableKoiiToken]);

  return (
    <div className="flex flex-col w-80 mx-auto">
      <label className="mb-1 text-left">{label}</label>
      <div className={wrapperDivClasses}>
        <div className="relative flex-grow">
          <div className="flex items-center justify-center gap-2 pr-20">
            <input
              type="number"
              inputMode="numeric"
              value={value}
              disabled={disabled}
              onChange={handleInputChange}
              placeholder="00"
              min="0"
              className="w-full h-10 text-3xl text-right text-white bg-transparent outline-none max-w-[246px]"
            />
            <span className="text-2xl">{tokenToTransfer.symbol}</span>
          </div>

          <DropdownMenu.Root onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger className="absolute right-0 flex items-center h-10 text-3xl transform -translate-y-1/2 top-1/2">
              <div className="flex items-center gap-1 mr-1">
                <TokenLogoDisplay token={tokenToTransfer} />
                <FontAwesomeIcon
                  icon={isOpen ? faChevronUp : faChevronDown}
                  className="w-3 h-3"
                />
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-50 p-1 w-[68px] -ml-2 text-white rounded-md bg-finnieBlue-light-tertiary max-h-28 overflow-y-auto">
                {[
                  ...(disableKoiiToken ? [] : [koiiTokenItem]),
                  ...tokensDropdownItems,
                ].map((token) => (
                  <DropdownMenu.Item
                    key={token.symbol}
                    className="flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-finnieBlue-light-secondary"
                    onSelect={() => handleTokenChange(token)}
                  >
                    <TokenLogoDisplay token={token} />
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="py-2 text-xs text-finnieTeal-100" />
      </div>

      <div className="pt-2 text-xs text-finnieTeal-100">
        {`${
          tokenToTransfer.symbol === 'KOII' && tokenToTransfer.name === 'Koii'
            ? koiiTokenBalance
            : getMainUnitFromDenomination(
                tokenToTransfer.balance,
                tokenToTransfer.decimals
              )
        } ${tokenToTransfer.symbol} available in your
    balance`}
      </div>
    </div>
  );
}
