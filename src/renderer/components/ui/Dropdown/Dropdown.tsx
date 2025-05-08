import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React, { forwardRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { DropdownItem } from './DropdownItem/DropdownItem';

export const DROPDOWN_MENU_ID = 'koii_dropdown_menu';
export const DEFAULT_PLACEHOLDER_TEXT = 'Select item';

export type DropdownItem = {
  label: string;
  id: string;
  disabled?: boolean;
};

export type DropdownProps = {
  items: DropdownItem[];
  placeholderText?: string;
  onSelect?: (
    item: DropdownItem
  ) => void | Promise<void> | boolean | Promise<boolean>;
  defaultValue?: DropdownItem | null;
  // validationError?: string;
  emptyListItemSlot?: React.ReactNode;
  customItem?: React.ReactNode;
  className?: string;
  containerClassOverrides?: string;
  dropdownId?: string;
};

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      items,
      defaultValue = null,
      placeholderText = DEFAULT_PLACEHOLDER_TEXT,
      customItem,
      emptyListItemSlot,
      className,
      onSelect,
      containerClassOverrides = '',
      dropdownId,
    },
    ref
  ) => {
    const [selected, setSelected] = useState<DropdownItem | null>(defaultValue);

    useEffect(() => {
      if (defaultValue) {
        setSelected(defaultValue);
      }
    }, [defaultValue]);

    const contentClasses = twMerge(
      // base
      'w-72 text-base text-white py-1 rounded-md p-[5px] bg-purple-5 focus:outline-none z-50 max-h-[320px] overflow-y-auto',
      // shadows
      'shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
      // animations
      'will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=bottom]:animate-slideUpAndFade'
    );

    const emptyListItem = emptyListItemSlot || (
      <div className="flex justify-center py-2 text-gray-500 cursor-not-allowed">
        No items
      </div>
    );

    const containerClasses = twMerge(
      className,
      'h-full w-72',
      containerClassOverrides
    );

    return (
      <div className={containerClasses} data-testid="koii_dropdown_test_id">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div>
              <button
                className="relative py-2 pl-3 pr-10 text-sm text-left rounded-lg shadow-md cursor-pointer w-72 text-gray bg-purple-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-finnieTeal sm:text-sm"
                aria-label="Customize options"
                ref={ref}
              >
                {selected ? (
                  <span className="block text-white truncate">
                    {selected.label}
                  </span>
                ) : (
                  <span>{placeholderText}</span>
                )}
              </button>
            </div>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={contentClasses}
              sideOffset={5}
              id={dropdownId ?? DROPDOWN_MENU_ID}
            >
              {customItem}
              {items.length
                ? items.map((item) => (
                    <DropdownItem
                      isSelected={selected?.id === item.id}
                      key={item.id}
                      label={item.label}
                      onSelect={async (e) => {
                        e.stopPropagation();
                        if (item.disabled) return;
                        const result = await onSelect?.(item);
                        if (result === false) return;
                        setSelected(item);
                      }}
                    />
                  ))
                : emptyListItem}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
