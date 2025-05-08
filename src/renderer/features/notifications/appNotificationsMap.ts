import { CRITICAL_MAIN_ACCOUNT_BALANCE } from 'config/node';
import { TaskNotificationPayloadType } from 'preload/apis/tasks/onTaskNotificationReceived';
import { getKoiiFromRoe } from 'utils';

import {
  AppNotificationType,
  BannerPlacement,
  NotificationType,
} from './types';

export const AppNotificationsMap: Record<
  AppNotificationType,
  Partial<NotificationType> & {
    title: string | ((...args: any[]) => string);
    message: string | ((...args: any[]) => string);
    notificationBanner: {
      componentKey: string;
      placement: BannerPlacement;
    } | null;
  }
> = {
  STAKING_KEY_MESSED_UP: {
    title: 'Staking Key Not Owned By Tasks Program',
    message:
      "Your staking key ran out of funds for rent and got deleted by the network. Now it's not owned by the Tasks Program as it should, and it won't be able to stake on tasks. Recover it to continue running tasks!",
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'STAKING_KEY_MESSED_UP',
      placement: BannerPlacement.TopBar,
    },
  },
  KPL_STAKING_KEY_MESSED_UP: {
    title: 'KPL Staking Key Not Owned By KPL Program',
    message:
      "Your KPL staking key ran out of funds for rent and got deleted by the network. Now it's not owned by the KPL Program as it should, and it won't be able to stake on KPL tasks. Recover it to continue running KPL tasks!",
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'KPL_STAKING_KEY_MESSED_UP',
      placement: BannerPlacement.TopBar,
    },
  },
  FIRST_NODE_REWARD: {
    title: 'First Node Reward',
    message:
      "You've earned your first node reward! Run more tasks to easily increase your rewards.",
    variant: 'SUCCESS',
    notificationBanner: {
      componentKey: 'FIRST_NODE_REWARD',
      placement: BannerPlacement.TopBar,
    },
  },
  RUN_BONUS_TASK: {
    title: 'Run Bonus Task',
    message: 'You can now run the Bonus Task to earn extra rewards!',
    variant: 'INFO',
    notificationBanner: {
      componentKey: 'RUN_BONUS_TASK',
      placement: BannerPlacement.TopBar,
    },
  },
  FIRST_TASK_RUNNING: {
    title: 'First Task Running',
    message:
      "Congrats! You're running your first task! Head over to Add Tasks to check out the rest of tasks available!",
    variant: 'SUCCESS',
    notificationBanner: {
      componentKey: 'FIRST_TASK_RUNNING',
      placement: BannerPlacement.Bottom,
    },
  },
  REFERRAL_PROGRAM: {
    title: 'Referral Program',
    message:
      'Refer a friend and win 5 extra tokens for each person who joins the network.',
    variant: 'INFO',
    notificationBanner: {
      componentKey: 'REFERRAL_PROGRAM',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_MAIN_KEY: {
    title: 'Low Main Key Balance',
    message:
      "Your main key's funds are getting low. Top up now to make sure your node keeps running tasks and making submissions.",
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'TOP_UP_MAIN_KEY',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_MAIN_KEY_CRITICAL: {
    title: 'Low Main Key Balance',
    message: `Your main key is below ${getKoiiFromRoe(
      CRITICAL_MAIN_ACCOUNT_BALANCE
    )} KOII. Fund now to keep your node working correctly.`,
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'TOP_UP_MAIN_KEY_CRITICAL',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_MAIN_KEY_WITH_REWARDS: {
    title: 'Low Main Key Balance',
    message:
      "Your main key's funds are getting low. Claim some rewards to make sure your node keeps running tasks and making submissions.",
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'TOP_UP_MAIN_KEY_WITH_REWARDS',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS: {
    title: 'Low Main Key Balance',
    message: `Your main key is below ${getKoiiFromRoe(
      CRITICAL_MAIN_ACCOUNT_BALANCE
    )} KOII. Claim some rewards to keep your node working correctly.`,
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'TOP_UP_MAIN_KEY_CRITICAL_WITH_REWARDS',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_STAKING_KEY: {
    title: 'Low Staking Key Balance',
    message:
      "Your staking key's funds are getting low. Top up now to make sure your node is safe.",
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'TOP_UP_STAKING_KEY',
      placement: BannerPlacement.TopBar,
    },
  },
  TOP_UP_STAKING_KEY_CRITICAL: {
    title: 'Low Staking Key Balance',
    message:
      'Your staking key is below 1 KOII. Fund now to keep your node in the network.',
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'TOP_UP_STAKING_KEY_CRITICAL',
      placement: BannerPlacement.TopBar,
    },
  },
  RUN_EXEMPTION_FLOW: {
    title: 'Rent Exemption Flow',
    message: 'We sent a little bonus to your staking key.',
    variant: 'INFO',
    notificationBanner: {
      componentKey: 'RUN_EXEMPTION_FLOW',
      placement: BannerPlacement.TopBar,
    },
  },
  TASK_UPGRADE: {
    title: 'Task Upgrade Available',
    message: (metadata: Record<string, unknown>) =>
      `Upgrade ${metadata.taskName as string} now to keep earning!`,
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'TASK_UPGRADE',
      placement: BannerPlacement.TopBar,
    },
  },
  UPDATE_AVAILABLE: {
    title: 'Update Available',
    message: 'A new version of the app is available. Please update now.',
    variant: 'INFO',
    notificationBanner: {
      componentKey: 'UPDATE_AVAILABLE',
      placement: BannerPlacement.TopBar,
    },
  },
  EXECUTABLE_MODIFIED_WARNING: {
    title: 'Task Executable Modified',
    message: (metadata: Record<string, unknown>) =>
      `The executable for task ${metadata.taskName as string} (${
        metadata.taskId as string
      }) has been modified. Your task will be restarted.`,
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'EXECUTABLE_MODIFIED_WARNING',
      placement: BannerPlacement.TopBar,
    },
  },
  TASK_NOTIFICATION: {
    title: (metadata: TaskNotificationPayloadType) =>
      `Task ${metadata.taskName as string}`,
    message: (metadata: TaskNotificationPayloadType) => metadata.message,
    notificationBanner: {
      componentKey: 'TASK_NOTIFICATION',
      placement: BannerPlacement.TopBar,
    },
  },
  NEW_TASK_AVAILABLE: {
    title: 'New Task Available',
    message: (taskName: string) =>
      `A New task is now available! Check out ${taskName} in "Add Tasks" to run it!`,
    variant: 'INFO',
    notificationBanner: null,
  },
  TASK_BLACKLISTED_OR_REMOVED: {
    title: 'Task Delisted',
    message: (taskName: string) =>
      `${taskName} was delisted but don't worry your rewards and stake are safe and ready to withdraw!`,
    variant: 'ERROR',
    notificationBanner: {
      componentKey: 'TASK_BLACKLISTED_OR_REMOVED',
      placement: BannerPlacement.Bottom,
    },
  },
  TASK_OUT_OF_BOUNTY: {
    title: 'Task Out of Bounty',
    message: '',
    variant: 'ERROR',
    notificationBanner: null,
  },
  BACKUP_SEED_PHRASE: {
    title: 'Backup Seed Phrase',
    message: '',
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'BACKUP_SEED_PHRASE',
      placement: BannerPlacement.Bottom,
    },
  },
  COMPUTER_MAX_CAPACITY: {
    title: 'Computer Max Capacity',
    message: '',
    variant: 'WARNING',
    notificationBanner: {
      componentKey: 'COMPUTER_MAX_CAPACITY',
      placement: BannerPlacement.Bottom,
    },
  },
  CLAIMED_REWARD: {
    title: 'Claimed Reward',
    message: '',
    variant: 'SUCCESS',
    notificationBanner: null,
  },
  FIRST_REWARD_ON_NEW_TASK: {
    title: 'First Reward on New Task',
    message: '',
    variant: 'SUCCESS',
    notificationBanner: null,
  },
  ARCHIVING_SUCCESSFUL: {
    title: 'Archiving Successful',
    message: '',
    variant: 'SUCCESS',
    notificationBanner: null,
  },
  SESSION_STARTED_FROM_SCHEDULER: {
    title: 'Session Started From Scheduler',
    message: '',
    variant: 'SUCCESS',
    notificationBanner: null,
  },
  TASK_STARTED: {
    title: 'Task Started',
    message: '',
    variant: 'SUCCESS',
    notificationBanner: null,
  },
  // External Notifications
  EXTERNAL_INFO: {
    title: '',
    message: '',
    variant: 'INFO',
    notificationBanner: {
      componentKey: 'EXTERNAL_INFO',
      placement: BannerPlacement.TopBar,
    },
  },
  EXTERNAL_OFFER: {
    title: '',
    message: '',
    variant: 'OFFER',
    notificationBanner: {
      componentKey: 'EXTERNAL_INFO',
      placement: BannerPlacement.TopBar,
    },
  },
};
