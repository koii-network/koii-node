import React, { ChangeEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { useTheme } from 'renderer/theme/ThemeContext';
import { getKoiiFromRoe, getRoeFromKoii } from 'utils';

interface PropsType {
  stake: number;
  minStake: number;
  meetsMinimumStake: boolean;
  onChange: (newStake: number) => void;
  disabled?: boolean;
  defaultValue?: number;
  tokenTicker?: string;
}

export function EditStakeInput({
  stake,
  minStake,
  meetsMinimumStake,
  onChange,
  disabled = false,
  defaultValue,
  tokenTicker,
}: PropsType) {
  const { theme } = useTheme();
  const hasError = !meetsMinimumStake;
  const inputClasses = twMerge(
    'w-[116px]  text-white rounded text-right p-[3px] border-2 border-transparent focus:border-finnieEmerald focus:outline-none px-2',
    hasError && 'border-finnieRed focus:border-finnieRed',
    theme === 'vip' ? 'bg-[#2d2d3f]' : 'bg-finnieBlue-light-tertiary'
  );
  const labelClasses = twMerge(
    'text-[11px] text-center h-4 min-h-4 pt-1 w-max',
    hasError ? 'text-finnieRed' : 'text-finnieTeal-100'
  );
  const stakeInKoii = getKoiiFromRoe(stake);
  const value = stakeInKoii !== 0 ? stakeInKoii : '';
  const placeholder = defaultValue ? String(getKoiiFromRoe(defaultValue)) : '0';

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value: newStakeInKoii },
  }) => {
    const newStakeInRoe = getRoeFromKoii(Number(newStakeInKoii));
    onChange(newStakeInRoe);
  };

  return (
    <div className="flex flex-col items-center w-fit cursor-default">
      <input
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        type="number"
        className={inputClasses}
        disabled={disabled}
        defaultValue={defaultValue}
      />
      <div className={labelClasses}>
        {!!minStake && `minimum: ${minStake} ${tokenTicker}`}
      </div>
    </div>
  );
}
