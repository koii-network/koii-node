import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRentExemptionFlow } from 'renderer/features/common/hooks/useRentExemptionFlow';
import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import { AppRoute } from 'renderer/types/routes';
// eslint-disable-next-line @cspell/spellchecker
import { v4 as uuidv4 } from 'uuid';

import { AppNotificationsMap } from '../appNotificationsMap';
import { useNotificationActions } from '../useNotificationStore';

export const useFirstNodeRewardLogic = () => {
  const navigate = useNavigate();
  const { getStakingWalletAirdrop } = useRentExemptionFlow();
  const { markAsRead, addNotification } = useNotificationActions();
  const { data: mainAccount } = useMainAccount();
  const notificationData = useMemo(
    () => AppNotificationsMap.RUN_EXEMPTION_FLOW,
    []
  );

  const handleShowRentExemptionFlowNotification = useCallback(async () => {
    const randomUuid = uuidv4();
    await getStakingWalletAirdrop()
      .then((res) => {
        console.log(res.message);
        addNotification({
          id: randomUuid,
          date: Date.now(),
          read: false,
          dismissed: false,
          accountPubKey: mainAccount ?? '',
          appNotificationDataKey: 'RUN_EXEMPTION_FLOW',
          variant: notificationData.variant ?? 'INFO',
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [
    addNotification,
    getStakingWalletAirdrop,
    mainAccount,
    notificationData.variant,
  ]);

  const handleSeeTasksAction = useCallback(
    (notificationId: string) => {
      markAsRead(notificationId);
      navigate(AppRoute.AddTask);
      handleShowRentExemptionFlowNotification();
    },
    [handleShowRentExemptionFlowNotification, markAsRead, navigate]
  );

  const handleClose = useCallback(() => {
    handleShowRentExemptionFlowNotification();
  }, [handleShowRentExemptionFlowNotification]);

  return {
    handleSeeTasksAction,
    handleClose,
  };
};
