import { ThemeType } from 'renderer/types/common';

export interface UserAppConfig {
  onboardingCompleted?: boolean;
  pin?: string;
  firstRewardNotificationDisplayed?: boolean;
  autoUpdatesDisabled?: boolean;
  hasCopiedReferralCode?: boolean;
  alphaUpdatesEnabled?: boolean;
  // when it's enabled it'll keep an ID that's used to disable it, when manually disabled it'll be false, and when unset it won't exist (undefined),
  // so we can differenciate unset from intentionally disabled and then enable it by default on app initialization.
  stayAwake?: number | false;
  launchOnRestart?: boolean;
  hideRPCStatus?: boolean;
  tasksThatAlreadyNotifiedUpgradesAvailable?: string[];
  limitLogsSize?: boolean;
  hasStartedTheMainnetMigration?: boolean;
  hasFinishedTheMainnetMigration?: boolean;
  shownNotifications?: string[];
  networkingFeaturesEnabled?: boolean;
  forceTunneling?: boolean;
  linkedAccounts?: string[];
  selectedRPC?: string;
  lastLostTokensClaimDate?: string;
  hasSeenNewWalletsSection?: boolean;
  shouldDisplayPrivateTasks?: boolean;
  hideRewardsBar?: boolean;
  hasRunFirstTask?: boolean;
  bannerVersion?: string;
  bannerShouldBeMinimized?: boolean;
  bonusTaskNotificationTimestamps?: number[];
  theme?: Record<string, ThemeType>;
  shouldDisplayBroaderKoiiEcosystemTasks?: boolean;
}

export interface StoreUserConfigParam {
  settings: UserAppConfig;
}

// eslint-disable-next-line @cspell/spellchecker
export const networkingMethods = ['upnp', 'tunneling'] as const;
export type NetworkingMethodsType = (typeof networkingMethods)[number];
