import {
  Icon,
  InformationCircleLine,
  ChevronArrowLine,
} from '@_koii/koii-styleguide';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React, { forwardRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { openBrowserWindow } from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { Popover } from '../Popover/Popover';
import { Tooltip } from '../Tooltip';

import { RPCDropdownItem } from './RPCDropdownItem/RPCDropdownItem';

export const DROPDOWN_MENU_ID = 'koii_RPC_dropdown_menu';
export const DEFAULT_PLACEHOLDER_TEXT = 'Select RPC';

export type RPCDropdownItem = {
  label: string;
  id: string;
  disabled?: boolean;
  status: string;
};

export type StatusDisplay = {
  textColor: string;
  tooltip: string;
  bgColor: string;
};

export type RPCDropdownProps = {
  items: RPCDropdownItem[];
  placeholderText?: string;
  onSelect?: (
    item: RPCDropdownItem
  ) => void | Promise<void> | boolean | Promise<boolean>;
  defaultValue?: RPCDropdownItem | null;
  // validationError?: string;
  emptyListItemSlot?: React.ReactNode;
  customItem?: React.ReactNode;
  className?: string;
  containerClassOverrides?: string;
  dropdownId?: string;
  imageSource: string;
  rateLimited?: boolean;
};

export const RPCDropdown = forwardRef<HTMLButtonElement, RPCDropdownProps>(
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
      imageSource,
      rateLimited,
    },
    ref
  ) => {
    const [selected, setSelected] = useState<RPCDropdownItem | null>(
      defaultValue
    );

    const [statusDisplay, setStatusDisplay] = useState<StatusDisplay>();

    useEffect(() => {
      if (defaultValue) {
        setSelected(defaultValue);
      }
    }, [defaultValue]);

    useEffect(() => {
      if (selected) {
        setStatusDisplay(getStatusColor(selected.status));
      } else {
        setStatusDisplay(getStatusColor(''));
      }
    }, [selected]);

    const contentClasses = twMerge(
      // base
      'w-[22rem] text-base text-white py-1 rounded-md p-[5px] bg-opacity-95 focus:outline-none z-50 max-h-[320px] overflow-y-auto',
      // shadows
      'shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
      // animations
      'will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=bottom]:animate-slideUpAndFade',
      // color
      statusDisplay?.bgColor
    );

    const emptyListItem = emptyListItemSlot || (
      <div className="flex justify-center py-2 text-gray-500 cursor-not-allowed">
        No items
      </div>
    );

    const containerClasses = twMerge(
      className,
      'h-full w-[22rem] flex justify-center items-center',
      containerClassOverrides
    );

    const getStatusColor = (status: string): StatusDisplay => {
      switch (status) {
        case 'EXCELLENT':
          return {
            textColor: 'text-[#9BE7C4]',
            tooltip: 'RPC Nodes in this region are stable, please keep mining',
            bgColor: 'bg-[#303f67]',
          };
        case 'GOOD':
          return {
            textColor: 'text-[#FFC78F]',
            tooltip: 'RPC Nodes delays, consider using a VPN',
            bgColor: 'bg-[#303f67]',
          };
        case 'POOR':
          return {
            textColor: 'text-[#FFA6A6]',
            tooltip:
              'RPC Nodes in this region are highly congested, consider using a VPN',
            bgColor: 'bg-[#41365b]',
          };
        default:
          return {
            textColor: 'text-white',
            tooltip: ' ',
            bgColor: 'bg-[#303f67]',
          };
      }
    };

    const openDiscordWindow = () => {
      openBrowserWindow('https://discord.gg/koii-network');
    };

    return (
      <div className={containerClasses} data-testid="koii_dropdown_test_id">
        {rateLimited ? (
          <div className="relative py-2 px-3 text-sm text-center rounded-lg h-13 shadow-md w-[22rem] text-gray bg-[#41365b] bg-opacity-90  sm:text-sm">
            <span>You&apos;ve been </span>
            <span className="italic font-bold text-red-400">rate-limited.</span>
            <span> Please contact the </span>
            <button onClick={openDiscordWindow} className="text-finnieTeal">
              customer service team.
            </button>
          </div>
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div>
                <button
                  className={`relative py-2 px-3 text-sm text-left rounded-lg h-13 shadow-md cursor-pointer w-[22rem] text-gray ${statusDisplay?.bgColor} bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-finnieTeal sm:text-sm`}
                  aria-label="Customize options"
                  ref={ref}
                >
                  <div className="flex flex-row items-center gap-5">
                    <div className="w-[10%]">
                      <Tooltip
                        theme={Theme.Dark}
                        tooltipContent={
                          <div className="max-w-[20rem] flex flex-col items-center">
                            <div className="w-full h-auto">
                              <img
                                alt="RPC status map"
                                src={imageSource}
                                className="mb-2"
                              />
                            </div>

                            <span>Please use VPN to change the RPC</span>
                          </div>
                        }
                        placement="bottom-right"
                      >
                        <Icon
                          source={InformationCircleLine}
                          className="text-white"
                        />
                      </Tooltip>
                    </div>
                    {selected ? (
                      <>
                        <div className="w-[35%]">
                          <Popover
                            theme={Theme.Dark}
                            tooltipContent={
                              "This status monitor allows you to track the RPC's health"
                            }
                          >
                            <span className="block text-white text-base">
                              {selected.label}
                            </span>
                          </Popover>
                        </div>
                        <div className="w-[35%]">
                          <Popover
                            theme={Theme.Dark}
                            tooltipContent={statusDisplay?.tooltip}
                          >
                            <span
                              className={`text-sm block ${statusDisplay?.textColor}`}
                            >
                              {selected.status}
                            </span>
                          </Popover>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="block text-white text-base w-[35%]">
                          {placeholderText}
                        </span>
                        <span className="block w-[35%]"> </span>
                      </>
                    )}
                    <Icon
                      source={ChevronArrowLine}
                      className="rotate-180 text-white w-[10%]"
                    />
                  </div>
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
                      <RPCDropdownItem
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
        )}
      </div>
    );
  }
);

RPCDropdown.displayName = 'RPCDropdown';
