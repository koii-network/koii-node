import { CheckIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  defaultValue: AMPM;
  onChange: (value: AMPM) => void;
  hasError?: boolean;
};

export enum AMPM {
  AM = 'AM',
  PM = 'PM',
}

export function SelectAmPm({
  defaultValue = AMPM.AM,
  onChange,
  hasError,
}: PropsType) {
  const inputClasses = twMerge(
    'text-sm leading-4 bg-purple-light-transparent w-[48px] py-2 text-center rounded-md border-2 border-transparent',
    hasError && 'border-finnieRed focus:border-finnieRed'
  );

  return (
    <Select.Root onValueChange={onChange} defaultValue={defaultValue}>
      <Select.Trigger className={inputClasses} aria-label="AmPm">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-20 overflow-hidden bg-purple-5 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
          <Select.Viewport className="p-[5px]">
            <SelectItem value={AMPM.AM}>{AMPM.AM}</SelectItem>
            <SelectItem value={AMPM.PM}>{AMPM.PM}</SelectItem>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

type SelectItemPropsType = {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemPropsType>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className="text-[13px] leading-none text-white rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';
