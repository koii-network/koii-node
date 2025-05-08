import { useEffect, useRef } from 'react';

import { BONUS_TASK_NAME } from 'config/node';
import { BONUS_TASK_EVENT } from 'renderer/features/notifications/Banners/RunBonusTaskNotification';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import { useUserAppConfig } from 'renderer/features/settings/hooks/useUserAppConfig';

// Time intervals for notifications (in milliseconds)
const TWO_HOURS = 2 * 60 * 60 * 1000;
const THREE_HOURS = 3 * 60 * 60 * 1000;
const SIX_HOURS = 2 * THREE_HOURS;

export function useBonusTask(isBonusTask: boolean, onCTAClick: () => void) {
  const { userConfig, isUserConfigLoading, handleSaveUserAppConfigAsync } =
    useUserAppConfig({});

  const { addAppNotification: showRunBonusTaskNotification } =
    useAppNotifications('RUN_BONUS_TASK');

  const hasBonusTaskNotificationBeenShown = useRef<boolean>(false);

  useEffect(() => {
    if (!isBonusTask) return;

    const handleBonusTaskClick = (event: CustomEvent) => {
      if (event.detail.taskName === BONUS_TASK_NAME) {
        onCTAClick();
      }
    };

    window.addEventListener(
      BONUS_TASK_EVENT,
      handleBonusTaskClick as EventListener
    );

    return () => {
      window.removeEventListener(
        BONUS_TASK_EVENT,
        handleBonusTaskClick as EventListener
      );
    };
  }, [isBonusTask, onCTAClick]);

  useEffect(() => {
    if (isUserConfigLoading) return;
    if (!isBonusTask) return;

    const checkAndShowNotification = async () => {
      if (hasBonusTaskNotificationBeenShown.current) return;

      const timestamps = userConfig?.bonusTaskNotificationTimestamps || [];
      console.log('CHECKING NOTIFICATION', { timestamps });
      const now = Date.now();

      // If no notifications have been shown yet, or if enough time has passed since the last notification
      if (
        timestamps.length === 0 ||
        (timestamps.length === 1 && now - timestamps[0] >= THREE_HOURS) ||
        (timestamps.length === 2 && now - timestamps[1] >= SIX_HOURS)
      ) {
        const bannerVersion = timestamps.length + 1;
        showRunBonusTaskNotification({ version: bannerVersion });
        hasBonusTaskNotificationBeenShown.current = true;
        // Update timestamps in user config
        const newTimestamps = [...timestamps, now].slice(-3); // Keep only last 3 timestamps
        await handleSaveUserAppConfigAsync({
          settings: {
            ...userConfig,
            bonusTaskNotificationTimestamps: newTimestamps,
          },
        });
      }
    };

    // Initial check
    checkAndShowNotification();

    // Set up periodic check every 2 hours
    const intervalId = setInterval(() => {
      // Reset the flag before checking, allowing a new notification if conditions are met
      hasBonusTaskNotificationBeenShown.current = false;
      checkAndShowNotification();
    }, TWO_HOURS);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isBonusTask, userConfig, isUserConfigLoading]);
}
