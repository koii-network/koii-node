/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Button,
  ButtonVariant,
  CloseLine,
  Icon,
  WarningCircleLine,
} from '@_koii/koii-styleguide';
import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { openBrowserWindow } from 'renderer/services';

type PropsType = {
  status: 'K2RateLimitExceeded' | 'KOffline';
  onClose?: () => void;
};

function StatusWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="z-50 rounded-tl-lg bg-gradient-to-b from-finnieBlue-dark-secondary to-finnieBlue">
      <div className="p-3 text-xs text-white bg-black rounded-tl-lg bg-opacity-20">
        {children}
      </div>
    </div>
  );
}

export function K2StatusIndicator({ status, onClose }: PropsType) {
  if (status === 'K2RateLimitExceeded') {
    return (
      <StatusWrapper>
        <span className="flex items-center gap-[6px] bg-bl">
          <Popover
            tooltipContent={
              <div>
                Visit our{' '}
                <span
                  className="font-bold underline cursor-pointer"
                  onClick={() =>
                    openBrowserWindow('http://discord.gg/koii-network')
                  }
                >
                  Discord
                </span>{' '}
                for more updates.
              </div>
            }
          >
            <Icon source={WarningCircleLine} className="mb-[3px]" size={16} />
          </Popover>
          Network unavailable, please be patient
          <Button
            variant={ButtonVariant.Ghost}
            iconLeft={
              <Icon source={CloseLine} className="mb-[3px]" size={16} />
            }
            onClick={onClose}
            className="p-0"
          />
        </span>
      </StatusWrapper>
    );
  }

  return null;
}
