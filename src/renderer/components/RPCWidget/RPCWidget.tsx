import { Icon, InformationCircleLine } from '@_koii/koii-styleguide';
import React, { useCallback, useState } from 'react';

import { useRPCStatus } from 'renderer/features/settings/hooks/useRPCStatus';
import { openBrowserWindow } from 'renderer/services';
import { useTheme } from 'renderer/theme/ThemeContext';
import { Theme } from 'renderer/types/common';

import { Popover } from '../ui/Popover/Popover';

const RATE_LIMIT_STORAGE_KEY = 'is-rate-limited-by-k2';

export function RPCWidget() {
  const [isLimited, setIsLimited] = useState(false);

  const { theme } = useTheme();
  const isVip = !!(theme === 'vip');

  const checkIfRateLimited = useCallback(() => {
    const rateLimitedTimestamp = window.localStorage.getItem(
      RATE_LIMIT_STORAGE_KEY
    );
    if (!rateLimitedTimestamp) return;

    const now = new Date().getTime();
    const storedTime = parseInt(rateLimitedTimestamp, 10);
    const isRateLimited = now - storedTime <= 300000;
    setIsLimited(isRateLimited);
  }, []);

  const { RPCInfo } = useRPCStatus({
    onSuccess: checkIfRateLimited,
  });

  const getStatusLabel = (value: number) => {
    if (value < 0.5) return 'EXCELLENT';
    if (value >= 0.5 && value < 0.9) return 'GOOD';
    return 'POOR';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return {
          color: isVip ? 'text-white vip-drop-shadow' : 'text-[#5ED9D1]',
          description: 'Network connection is optimal',
        };
      case 'GOOD':
        return {
          color: 'text-yellow-500',
          description: 'Network connection is stable',
        };
      case 'POOR':
        return {
          color: 'text-red-500',
          description: 'Network connection is unstable',
        };
      default:
        return {
          color: 'text-gray-500',
          description: 'Network connection status unknown',
        };
    }
  };

  const currentStatus =
    RPCInfo?.[0]?.value !== undefined
      ? getStatusLabel(RPCInfo[0].value)
      : 'UNKNOWN';

  const { color: statusColor, description: statusDescription } =
    getStatusInfo(currentStatus);

  const openStatusPage = async () => {
    await openBrowserWindow('https://koii.statuspage.io/');
  };

  return (
    <div className="flex flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#BEF0ED]/10">
      <Popover tooltipContent="View a more detailed status" theme={Theme.Dark}>
        <button
          className="text-white/80 hover:text-white hover:brightness-125 hover:scale-110 hover:rotate-[361deg] transition-all duration-300 ease-in-out font-medium text-sm flex items-center gap-2"
          onClick={openStatusPage}
        >
          <Icon source={InformationCircleLine} className="w-5 h-5" />
        </button>
      </Popover>
      <span className="text-white/80">RPC Status</span>
      <span
        className={`text-sm font-medium ${statusColor} ${
          isLimited ? 'opacity-50' : ''
        }`}
      >
        {currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}
      </span>
    </div>
  );
}
