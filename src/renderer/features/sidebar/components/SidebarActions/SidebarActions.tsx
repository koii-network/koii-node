import {
  AddLine,
  Icon,
  TipGiveLine,
  WebCursorXlLine,
} from '@_koii/koii-styleguide';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useFundNewAccountModal } from 'renderer/features/common';

type PropsType = {
  onPrimaryActionClick: () => void;
  onSecondaryActionClick: () => void;
  showMyNodeAction?: boolean;
};

const ICON_SIZE = 26;

export function SidebarActions({
  onPrimaryActionClick,
  onSecondaryActionClick,
  showMyNodeAction,
}: PropsType) {
  const { showModal: showFundModal } = useFundNewAccountModal();

  const actionBaseClasses =
    'flex items-center rounded-md justify-center w-full h-full cursor-pointer';
  const primaryActionClasses = twMerge(
    actionBaseClasses,
    'text-white',
    'bg-finnieBlue-light-secondary'
  );
  const secondaryActionClasses = twMerge(
    actionBaseClasses,
    showMyNodeAction ? 'bg-finnieTeal-100' : 'bg-finnieTeal'
  );

  const handleKeyDown =
    (callback: () => void) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback();
      }
    };

  const handleAddFundsClick = () => {
    showFundModal();
    onPrimaryActionClick?.();
  };

  return (
    <div className="flex justify-between h-10 gap-4 lgh:h-12 transition-all duration-300 ease-in-out">
      <Popover tooltipContent="Get some funds." className="w-full h-full">
        <div
          className={primaryActionClasses}
          onKeyDown={handleKeyDown(handleAddFundsClick)}
          onClick={handleAddFundsClick}
          tabIndex={0}
          role="button"
          data-testid="sidebar_tip_give_button"
        >
          <div className="flex flex-col items-center gap-2">
            <Icon
              source={TipGiveLine}
              size={ICON_SIZE}
              data-testid="tip-give-icon"
              aria-label="TipGiveLine icon"
            />
          </div>
        </div>
      </Popover>

      <Popover
        tooltipContent={
          showMyNodeAction
            ? 'See your running tasks.'
            : 'Add more tasks to your node.'
        }
        className="w-full h-full"
      >
        <div
          className={secondaryActionClasses}
          onClick={onSecondaryActionClick}
          onKeyDown={handleKeyDown(onSecondaryActionClick)}
          data-testid="sidebar_web_cursor_button"
          tabIndex={0}
          role="button"
        >
          <div className="flex flex-col items-center gap-1">
            <Icon
              source={showMyNodeAction ? WebCursorXlLine : AddLine}
              size={ICON_SIZE}
              data-testid="add-line-icon"
              aria-label="AddLine icon"
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}
