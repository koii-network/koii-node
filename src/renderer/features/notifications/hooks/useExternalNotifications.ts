import { useQuery } from 'react-query';

import {
  AppNotificationType,
  ExternalNotification,
  NotificationVariantType,
} from 'renderer/features/notifications/types';
import {
  useNotificationActions,
  useNotificationStore,
} from 'renderer/features/notifications/useNotificationStore';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import {
  fetchExternalNotificationsFromAws,
  getVersion,
  QueryKeys,
} from 'renderer/services';
// eslint-disable-next-line @cspell/spellchecker
import { v4 as uuidv4 } from 'uuid';

import { getShouldDisplayNotification } from '../helpers/getShouldDisplayNotification';
import { isExternalNotification } from '../helpers/isExternalNotification';

export const useExternalNotifications = () => {
  const { handleSaveUserAppConfigAsync, refetchUserConfig } =
    useUserAppConfig();
  const { data: mainAccount } = useMainAccount();
  const { addNotification } = useNotificationActions();
  const localNotifications = useNotificationStore(
    (state) => state.notifications
  );

  const markAsShown = (id: string) => {
    handleSaveUserAppConfigAsync({
      settings: {
        shownNotifications: [...localNotifications.map((n) => n.id), id],
      },
    });
  };

  const isNotificationShown = async (id: string) => {
    const { data: userConfig } = await refetchUserConfig();
    return userConfig?.shownNotifications?.includes(id);
  };

  useQuery(
    [QueryKeys.ExternalNotifications],
    fetchExternalNotificationsFromAws,
    {
      // fetch notifications while app initialization and then every 15 minutes
      refetchInterval: 15 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      enabled: !!mainAccount,
      async onSuccess(data) {
        const appVersion = await getVersion();
        const externalNotifications = data as ExternalNotification[];

        externalNotifications.forEach(async (externalNotification) => {
          const isValid = isExternalNotification(externalNotification);

          if (!isValid) {
            return;
          }

          if (
            localNotifications.some((n) => n.id === externalNotification.id)
          ) {
            return;
          }

          const shouldDisplay = getShouldDisplayNotification(
            externalNotification.conditions,
            { appVersion: appVersion.packageVersion }
          );

          const wasNotificationShown = await isNotificationShown(
            externalNotification.id
          );

          if (!externalNotification?.persist && wasNotificationShown) {
            // if not persist and already shown, don't show it again
            return;
          }

          if (!shouldDisplay) {
            return;
          }

          const randomUuid = uuidv4();
          const notification = {
            id: externalNotification.id ?? randomUuid,
            title: externalNotification.title,
            date: Date.now(),
            read: false,
            dismissed: false,
            accountPubKey: mainAccount ?? '',
            appNotificationDataKey: 'EXTERNAL_INFO' as AppNotificationType,
            variant: externalNotification.type as NotificationVariantType,
            metadata: {},
            customMessage: externalNotification.text,
            ctaLink: externalNotification.ctaLink,
            ctaText: externalNotification.ctaText,
            persist: externalNotification.persist,
          };

          addNotification(notification).then(() => {
            if (!notification.persist) {
              markAsShown(notification.id);
            }
          });
        });
      },
    }
  );
};
