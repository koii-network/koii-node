import {
  BrowseInternetLine,
  ExtentionPuzzleFill,
  ExtentionPuzzleLine,
  LockFill,
  LockLine,
  NotificationOffFill,
  NotificationOnLine,
  SettingsFill,
  SettingsLine,
  TooltipChatQuestionLeftFill,
  TooltipChatQuestionRightLine,
  WalletFill,
} from '@_koii/koii-styleguide';
import React from 'react';

import Time from 'assets/svgs/Time.svg';
import TimeFill from 'assets/svgs/TimeFill.svg';
import { AppRoute } from 'renderer/types/routes';

import {
  AutomateSettings,
  GeneralSettings,
  Help,
  NetworkAndUPNPSettings,
  NotificationsSettings,
  Privacy,
  TaskExtensionsSettings,
} from './components';
import { Accounts } from './components/Accounts';
import { SettingsSection } from './types';

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    label: 'General',
    icon: SettingsLine,
    iconFocused: SettingsFill,
    path: AppRoute.SettingsGeneral,
    component: GeneralSettings,
  },
  {
    label: 'Wallet',
    icon: WalletFill,
    iconFocused: WalletFill,
    path: AppRoute.SettingsWallet,
    component: Accounts,
  },
  // {
  //   label: 'Accounts',
  //   icon: KeyUnlockLine,
  //   iconFocused: KeyUnlockLine,
  //   path: AppRoute.SettingsSecurity,
  //   component: SecuritySettings,
  // },
  {
    label: 'Task Extensions',
    icon: ExtentionPuzzleLine,
    iconFocused: ExtentionPuzzleFill,
    path: AppRoute.SettingsExtensions,
    component: TaskExtensionsSettings,
  },
  {
    label: 'Automate Node',
    icon: (props) => <Time {...props} />,
    iconFocused: (props) => <TimeFill {...props} />,
    path: AppRoute.SettingsAutomateNode,
    component: AutomateSettings,
  },
  {
    label: 'Networking',
    icon: BrowseInternetLine,
    iconFocused: BrowseInternetLine,
    path: AppRoute.SettingsNetworkAndUPNP,
    component: NetworkAndUPNPSettings,
  },
  {
    label: 'Notifications',
    icon: NotificationOnLine,
    iconFocused: NotificationOffFill,
    path: AppRoute.SettingsNotifications,
    component: NotificationsSettings,
    disabled: true,
  },
  {
    label: 'Lock',
    icon: LockLine,
    iconFocused: LockFill,
    path: AppRoute.SettingsPrivacy,
    component: Privacy,
  },
  {
    label: 'Help',
    icon: TooltipChatQuestionRightLine,
    iconFocused: TooltipChatQuestionLeftFill,
    path: AppRoute.SettingsHelp,
    component: Help,
  },
];
