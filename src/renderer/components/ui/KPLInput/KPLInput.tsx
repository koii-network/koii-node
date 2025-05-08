import React, { ChangeEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  tokenSymbol: string;
  disabled?: boolean;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  value?: number;
  className?: string;
};

export function KPLInputNew({
  disabled,
  onInputChange,
  value,
  className,
  tokenSymbol,
}: PropsType) {
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onInputChange(e);
  };

  const wrapperDivClasses = twMerge(
    'flex w-[246px] items-center justify-center px-4 py-2 space-x-1 text-white duration-500 rounded-md bg-finnieBlue-light-tertiary transition-width mx-auto',
    className
  );

  return (
    <div className={wrapperDivClasses}>
      <div className="relative flex-grow">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          placeholder="00"
          className="w-full h-10 text-3xl text-right text-white bg-transparent outline-none max-w-[246px] pr-16" // added right padding
        />
        <span className="absolute text-3xl transform -translate-y-1/2 top-1/2 right-[-6px]">
          {tokenSymbol}
        </span>{' '}
      </div>
    </div>
  );
}
