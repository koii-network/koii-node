import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  label: string;
  onSelect?: (event: Event) => void;
  isSelected?: boolean;
};

export function RPCDropdownItem({ label, onSelect, isSelected }: PropsType) {
  const itemClasses = twMerge(
    // base
    'py-1 my-1 text-sm font-normal text-white border-2 border-transparent rounded-lg group flex items-center relative pl-4',
    // resets
    'select-none outline-none',
    // selected
    isSelected && 'border-[#4b587a] font-semibold text-finnieTeal',
    // highlighted
    'hover:bg-[#4b587a] hover:text-finnieTeal',
    // disabled
    'data-[disabled]:text-gray-500 data-[disabled]:cursor-not-allowed'
  );
  return (
    <DropdownMenu.Item onSelect={onSelect} className={itemClasses}>
      {label}
    </DropdownMenu.Item>
  );
}
