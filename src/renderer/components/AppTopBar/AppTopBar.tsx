import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

import RefreshIcon from 'assets/svgs/refresh-icon.svg';
import RefreshIconVIP from 'assets/svgs/reload-vip.svg';
import { useExternalNotifications, useUserAppConfig } from 'renderer/features';
import { useNetworkMigrationModal } from 'renderer/features/networkMigration';
import { useNotificationBanner } from 'renderer/features/notifications';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import { useUpgradeTasksContext } from 'renderer/features/tasks/context/upgrade-tasks-context';
import { getNetworkUrl, QueryKeys } from 'renderer/services';
import { useTheme } from 'renderer/theme/ThemeContext';
import { AppRoute } from 'renderer/types/routes';

import { BackButton } from '../BackButton';
import { RPCWidget } from '../RPCWidget';
import { StartStopAllTasks } from '../StartStopAllTask';
import { Button, Tooltip } from '../ui';

export function AppTopBar() {
  const { userConfig, isUserConfigLoading } = useUserAppConfig({});
  const location = useLocation();
  useExternalNotifications();
  const { unreadNotificationsWithBannerTopBar } = useNotificationBanner();

  const { data: networkUrl, isLoading: isLoadingNetworkUrl } = useQuery(
    QueryKeys.GetNetworkUrl,
    getNetworkUrl
  );

  const shouldMigrateNetwork =
    !isLoadingNetworkUrl &&
    !!networkUrl &&
    (networkUrl !== MAINNET_RPC_URL ||
      (userConfig?.onboardingCompleted &&
        !userConfig?.hasFinishedTheMainnetMigration)) &&
    !isUserConfigLoading &&
    !userConfig?.hasFinishedTheMainnetMigration;

  const networkMigrationPhase = userConfig?.hasStartedTheMainnetMigration
    ? 2
    : 1;

  const { showModal: showNetworkMigrationModal } = useNetworkMigrationModal({
    migrationPhase: networkMigrationPhase,
    newNetworkRpcUrl: MAINNET_RPC_URL,
  });

  if (shouldMigrateNetwork) {
    showNetworkMigrationModal();
  }

  const hideRPCWidget = userConfig?.hideRPCStatus;

  const handleNodeRefresh = () => {
    window.location.reload();
  };

  const { isUpgradingTask } = useUpgradeTasksContext();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-01-13T12:00:00Z');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const thereIsNoTimeLeft = useCallback(
    () =>
      timeLeft.days < 1 &&
      timeLeft.hours < 1 &&
      timeLeft.minutes < 1 &&
      timeLeft.seconds < 1,
    [timeLeft]
  );

  const { theme } = useTheme();
  const isVip = theme === 'vip';
  const RefreshIconAsset = isVip ? RefreshIconVIP : RefreshIcon;
  const refreshIconClassName = `text-white transition-all duration-300 ${
    isVip
      ? 'w-11 h-11 rotate-90 hover:rotate-[271deg]'
      : 'w-10 h-10 hover:rotate-180'
  }`;

  return (
    <div className="flex justify-between w-full mx-auto h-[80px] relative z-50">
      {/* {unreadNotificationsWithBannerTopBar.length > 0 ? (
        <DisplayTopBarNotifications
          topBarNotifications={unreadNotificationsWithBannerTopBar}
          BackButtonSlot={BackButton}
        />
      ) : ( */}
      <div className="flex items-center justify-between w-full gap-4 px-4 mx-auto">
        <div className="flex items-center justify-center">
          <BackButton />
          <Tooltip
            tooltipContent={
              isUpgradingTask
                ? "Can't reload the UI while a task is upgrading. Please wait."
                : 'Reload the UI'
            }
          >
            <Button
              onlyIcon
              icon={
                <RefreshIconAsset
                  className={refreshIconClassName}
                  color="#fff"
                />
              }
              disabled={isUpgradingTask}
              onClick={handleNodeRefresh}
            />
          </Tooltip>
          {AppRoute.MyNode === location.pathname && <StartStopAllTasks />}
        </div>

        {/* {!thereIsNoTimeLeft && (
            <div className="flex flex-col items-center text-white absolute left-1/2 transform -translate-x-1/2">
              <span className="text-xs mb-0.5 2xl:text-sm">TOKEN LAUNCH</span>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-base 2xl:text-lg bg-[#5ED9D133] rounded-lg w-[42px] h-[28px] flex items-center justify-center !leading-[normal]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-finnieTeal mt-0.5">D</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base 2xl:text-lg bg-[#5ED9D133] rounded-lg w-[42px] h-[28px] flex items-center justify-center !leading-[normal]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-finnieTeal mt-0.5">H</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base 2xl:text-lg bg-[#5ED9D133] rounded-lg w-[42px] h-[28px] flex items-center justify-center !leading-[normal]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-finnieTeal mt-0.5">M</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base 2xl:text-lg bg-[#5ED9D133] rounded-lg w-[42px] h-[28px] flex items-center justify-center !leading-[normal]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-finnieTeal mt-0.5">S</span>
                </div>
              </div>
            </div>
          )} */}

        {!hideRPCWidget && <RPCWidget />}
      </div>
      {/* )} */}
    </div>
  );
}
