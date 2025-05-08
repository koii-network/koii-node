import { FunctionComponent } from 'react';

export enum NotificationPlacement {
  TopBar = 'TopBar',
  Bottom = 'Bottom',
}

export enum BannerPlacement {
  TopBar = 'TopBar',
  Bottom = 'Bottom',
}

export type BackButtonSlotType = FunctionComponent<{ color: 'white' | 'blue' }>;

export const NotificationVariants = {
  SUCCESS: 'Success',
  WARNING: 'Warning',
  ERROR: 'Error',
  INFO: 'Info',
  OFFER: 'Offer',
} as const;

export type NotificationVariantType = keyof typeof NotificationVariants;

export interface NotificationType {
  id: string;
  date: number;
  read: boolean; // Indicates whether the notification has been read on the notification center
  dismissed: boolean; // Indicates whether the notification has been dismissed from the modal UI
  accountPubKey: string;
  variant: NotificationVariantType;
  appNotificationDataKey: AppNotificationType;
  customTitle?: string;
  customMessage?: string;
  ctaLink?: string;
  ctaText?: string;
  persist?: boolean;
  metadata?: Record<string, unknown>;
  hideBanner?: boolean;
}

export type AppNotificationType =
  | 'FIRST_NODE_REWARD'
  | 'FIRST_TASK_RUNNING'
  | 'TOP_UP_STAKING_KEY'
  | 'RUN_EXEMPTION_FLOW'
  | 'TOP_UP_STAKING_KEY_CRITICAL'
  | 'REFERRAL_PROGRAM'
  | 'TASK_UPGRADE'
  | 'NEW_TASK_AVAILABLE'
  | 'TASK_BLACKLISTED_OR_REMOVED'
  | 'TASK_OUT_OF_BOUNTY'
  | 'BACKUP_SEED_PHRASE'
  | 'COMPUTER_MAX_CAPACITY'
  | 'CLAIMED_REWARD'
  | 'FIRST_REWARD_ON_NEW_TASK'
  | 'UPDATE_AVAILABLE'
  | 'ARCHIVING_SUCCESSFUL'
  | 'SESSION_STARTED_FROM_SCHEDULER'
  | 'TASK_STARTED'
  | 'EXTERNAL_INFO'
  | 'EXTERNAL_OFFER'
  | 'TOP_UP_MAIN_KEY'
  | 'TOP_UP_MAIN_KEY_CRITICAL'
  | 'TOP_UP_MAIN_KEY_WITH_REWARDS'
  | 'TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS'
  | 'STAKING_KEY_MESSED_UP'
  | 'KPL_STAKING_KEY_MESSED_UP'
  | 'EXECUTABLE_MODIFIED_WARNING'
  | 'TASK_NOTIFICATION'
  | 'RUN_BONUS_TASK';

export type AppNotificationDataType = {
  message: string | ((...args: any[]) => string);
  title: string;
  banner: { placement: BannerPlacement; component: JSX.Element } | null;
  notificationCenterAction: {
    fn: () => void;
    label: string;
  };
  variant: NotificationVariantType;
};

export type ExternalNotificationDisplayConditionsType = {
  version?: string;
  excludeAppVersions?: string[];
};

export type ExternalNotification = {
  id: string;
  text: string;
  title: string;
  type: NotificationVariantType;
  ctaLink: string;
  ctaText: string;
  persist?: boolean;
  conditions?: ExternalNotificationDisplayConditionsType;
};
