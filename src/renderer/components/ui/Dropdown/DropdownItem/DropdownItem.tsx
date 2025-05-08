import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PropsType = {
  label: string;
  onSelect?: (event: Event) => void;
  isSelected?: boolean;
};

export function DropdownItem({ label, onSelect, isSelected }: PropsType) {
  const itemClasses = twMerge(
    // base
    'py-1 my-1 text-sm font-normal text-white border-2 border-transparent rounded-lg group flex items-center relative pl-4',
    // resets
    'select-none outline-none',
    // selected
    isSelected && 'border-purple-1 font-semibold text-finnieTeal-100',
    // highlighted
    'hover:bg-purple-1 hover:text-finnieTeal-100',
    // disabled
    'data-[disabled]:text-gray-500 data-[disabled]:cursor-not-allowed'
  );
  return (
    <DropdownMenu.Item onSelect={onSelect} className={itemClasses}>
      {label}
    </DropdownMenu.Item>
  );
}
