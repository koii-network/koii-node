import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';

import { AppTopBar } from 'renderer/components/AppTopBar';
import { SettingsSidebar } from 'renderer/features';
import { K2StatusIndicator } from 'renderer/features/network';
import { useNetworkStatusContext } from 'renderer/features/network/context/NetworkStatusContext';
import {
  DisplayBottomNotifications,
  DisplayTopBarNotifications,
  useNotificationBanner,
} from 'renderer/features/notifications';
import { Sidebar } from 'renderer/features/sidebar';
import { VersionDisplay } from 'renderer/features/sidebar/components';
import { QueryKeys } from 'renderer/services';
import { useTheme } from 'renderer/theme/ThemeContext';
import { AppRoute } from 'renderer/types/routes';

import { BackButton } from '../BackButton';
import Header from '../Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  const { k2RateLimitError, setK2RateLimitError } = useNetworkStatusContext();
  const { unreadNotificationsWithBannerBottom, unseenNotificationsWithBanner } =
    useNotificationBanner();

  const location = useLocation();
  const [os, setOs] = useState<'windows' | 'macos' | 'linux' | null>(null);

  const isSettingsView = useMemo(
    () => location.pathname.includes(AppRoute.Settings),
    [location]
  );

  const zIndexOfMainContent =
    unseenNotificationsWithBanner.length > 0 ? 'z-10' : 'z-50';

  const { theme } = useTheme();

  const queryClient = useQueryClient();

  useEffect(() => {
    window.main.onVariablesUpdatedFromMainProcess(() => {
      queryClient.invalidateQueries([QueryKeys.TaskVariables]);
      queryClient.invalidateQueries([QueryKeys.TaskVariablesNames]);
      queryClient.invalidateQueries([QueryKeys.StoredTaskVariables]);
      queryClient.invalidateQueries([QueryKeys.StoredPairedTaskVariables]);
      queryClient.invalidateQueries([QueryKeys.TasksPairedWithVariable]);
      queryClient.invalidateQueries([QueryKeys.StoredTaskPairedTaskVariables]);
    });
  }, [queryClient]);

  useEffect(() => {
    window.main.getOperativeSystem().then((os) => {
      setOs(os);
    });
  }, []);

  return (
    <div
      className={`relative flex flex-col flex-grow min-h-full overflow-x-hidden overflow-y-hidden min-w-fit ${
        theme === 'vip'
          ? 'bg-[url(assets/svgs/vip-pattern.svg)] bg-top before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#383838]/70 before:via-black before:to-black before:pointer-events-none'
          : 'bg-main-gradient'
      }`}
    >
      <Header />
      <AppTopBar />

      {unseenNotificationsWithBanner.length > 0 ? (
        <DisplayTopBarNotifications
          topBarNotifications={unseenNotificationsWithBanner}
          BackButtonSlot={BackButton}
          os={os}
        />
      ) : null}
      <div className="relative flex flex-grow min-h-0 px-4 pt-3 mt-1">
        {isSettingsView ? <SettingsSidebar /> : <Sidebar />}
        <div
          className={`flex flex-col flex-grow min-h-0 h-[calc(100vh-90px)] z-50 pb-4 ${zIndexOfMainContent}`}
        >
          {children}
        </div>
        <DisplayBottomNotifications
          bottomNotifications={unreadNotificationsWithBannerBottom}
        />
      </div>

      {/* {Number(height) >= 820 && !k2RateLimitError && ( */}
      <div className="absolute -bottom-0.5 right-0.5">
        <VersionDisplay />
      </div>
      {/* )} */}

      {k2RateLimitError && (
        <div className="absolute bottom-0 right-0 z-50">
          <K2StatusIndicator
            status="K2RateLimitExceeded"
            onClose={() => {
              setK2RateLimitError(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
