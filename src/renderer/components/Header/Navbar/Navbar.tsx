import { Icon, TooltipChatQuestionRightLine } from '@_koii/koii-styleguide';
import { faAdd, faHome, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

// import { OrcaActionsDropdown } from 'renderer/features/orca/OrcaActionsDropdown';
import NewIcon from 'assets/svgs/new.svg';
import NotificationsIcon from 'assets/svgs/notifications.svg';
import SettingsIcon from 'assets/svgs/settings.svg';
import WalletIcon from 'assets/svgs/wallet.svg';
import { useUserAppConfig } from 'renderer/features';
import { useNotificationBanner } from 'renderer/features/notifications';
import { useNotificationActions } from 'renderer/features/notifications/useNotificationStore';
import { useOrcaContext } from 'renderer/features/orca/context/orca-context';
import { OrcaButton } from 'renderer/features/orca/OrcaButton';
import { AppRoute } from 'renderer/types/routes';

const navItems = [
  {
    icon: (
      <FontAwesomeIcon
        icon={faHome}
        size="lg"
        className="group-hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
    to: AppRoute.MyNode,
    label: 'My Node',
  },
  {
    icon: (
      <FontAwesomeIcon
        icon={faAdd}
        size="lg"
        className="group-hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
    to: AppRoute.AddTask,
    label: 'Add Task',
  },
  {
    icon: (
      <FontAwesomeIcon
        icon={faShare}
        size="lg"
        className="group-hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
    to: AppRoute.Referral,
    label: 'Referrals',
  },
  {
    to: '/notifications',
    label: (props: { numberOfUnreadNotifications: number }) => {
      const { numberOfUnreadNotifications } = props;
      return (
        <div className="relative">
          <Icon
            source={NotificationsIcon}
            className="h-7 w-7 hover:rotate-45 transition-all duration-200 ease-in-out"
          />
          {numberOfUnreadNotifications > 0 && (
            <div
              className={`absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-md min-w-[25px] h-4 flex items-center justify-center ${
                numberOfUnreadNotifications > 15 ? 'pl-[5px] pr-[3px]' : 'px-1'
              }`}
            >
              {numberOfUnreadNotifications > 15
                ? '15+'
                : numberOfUnreadNotifications}
            </div>
          )}
        </div>
      );
    },
  },
  {
    to: AppRoute.SettingsHelp,
    label: (
      <Icon
        source={TooltipChatQuestionRightLine}
        className="h-5 w-5 mx-1 hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
  },
  {
    new: true,
    to: AppRoute.SettingsWallet,
    label: (
      <Icon
        source={WalletIcon}
        className="h-7 w-7 hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
  },
  {
    to: AppRoute.SettingsGeneral,
    label: (
      <Icon
        source={SettingsIcon}
        className="h-7 w-7 hover:rotate-45 transition-all duration-200 ease-in-out"
      />
    ),
  },
];

function Navbar(): JSX.Element {
  const { userConfig, isUserConfigLoading, handleSaveUserAppConfig } =
    useUserAppConfig({});

  const { unreadNotificationsWithBannerTopBar, unseenNotificationsWithBanner } =
    useNotificationBanner();

  const { markAsDismissed } = useNotificationActions();

  const markAllNotificationsAsDismissed = async () => {
    try {
      for (const notification of unseenNotificationsWithBanner) {
        await markAsDismissed(notification.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const numberOfUnreadNotifications =
    unreadNotificationsWithBannerTopBar.length;

  const clickOnNewTag = () => {
    handleSaveUserAppConfig({ settings: { hasSeenNewWalletsSection: true } });
  };

  const shouldSeeTheNewTag =
    !userConfig?.hasSeenNewWalletsSection && !isUserConfigLoading;

  const {
    loadingOrcaPodman,
    data: { isOrcaVMRunning, isOrcaVMInstalled, isPodmanInstalled },
  } = useOrcaContext();

  const getOrcaStatus = () => {
    if (loadingOrcaPodman) {
      return 'loading';
    }

    if (!isOrcaVMInstalled || !isPodmanInstalled) {
      return 'not installed';
    }

    if (isOrcaVMRunning) {
      return 'running';
    }

    return 'paused';
  };

  // Update navItems with the notification count
  const navItemsWithNotifications = navItems.map((item) => {
    if (item.to === '/notifications') {
      return {
        ...item,
        label:
          typeof item.label === 'function'
            ? item.label({ numberOfUnreadNotifications })
            : item.label,
      };
    }
    return item;
  });

  return (
    <nav className="flex items-center justify-between">
      {navItemsWithNotifications.map((item) => (
        <NavLink
          className={({ isActive }) =>
            twMerge(
              'transition duration-200 ease-in-out group',
              isActive ? 'text-finnieTeal' : 'text-white',
              item.new && shouldSeeTheNewTag && 'text-finnieEmerald',
              'hover:scale-110'
            )
          }
          key={item.to}
          to={item.to}
          onClick={() => {
            if (item.to === '/notifications') {
              markAllNotificationsAsDismissed();
            } else if (item.new) {
              clickOnNewTag();
            }
          }}
        >
          <div className="tracking-wide ml-7 text-right my-auto relative flex items-center gap-2">
            {shouldSeeTheNewTag && item.new && (
              <Icon source={NewIcon} className="h-9 w-9" />
            )}
            {item.icon}
            <span className="text-sm select-disabled">
              {typeof item.label === 'function'
                ? item.label({ numberOfUnreadNotifications })
                : item.label}
            </span>
          </div>
        </NavLink>
      ))}

      <div className="ml-6">
        <OrcaButton status={getOrcaStatus()} />
      </div>
    </nav>
  );
}

export default Navbar;
