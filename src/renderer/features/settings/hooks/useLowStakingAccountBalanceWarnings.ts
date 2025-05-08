import { useState, useEffect, useMemo } from 'react';

import { getKoiiFromRoe } from 'utils';

import { useAccountBalance } from './useAccountBalance';
import { useMainAccount } from './useMainAccount';
import { useStakingAccount } from './useStakingAccount';

const CRITICAL_STAKING_ACCOUNT_BALANCE = 0.99;
const MINIMUM_PUBLIC_BALANCE_TO_TRIGGER = 2.1;
// const LOW_STAKING_ACCOUNT_BALANCE = 5;

export const useLowStakingAccountBalanceWarnings = ({
  showCriticalBalanceNotification,
}: {
  showCriticalBalanceNotification: () => void;
}) => {
  const { data: stakingPublicKey } = useStakingAccount();
  const { data: mainAccount } = useMainAccount();

  const { accountBalance: stakingAccountBalance } =
    useAccountBalance(stakingPublicKey);

  const { accountBalance: mainAccountBalance } = useAccountBalance(mainAccount);

  const [previousBalance, setPreviousBalance] = useState<number | null>(null);

  const stakingAccountBalanceInKoii = useMemo(
    () => stakingAccountBalance && getKoiiFromRoe(stakingAccountBalance),
    [stakingAccountBalance]
  );

  const publicAccountBalanceInKoii = useMemo(
    () => mainAccountBalance && getKoiiFromRoe(mainAccountBalance),
    [mainAccountBalance]
  );

  const displayStakingAlerts =
    (publicAccountBalanceInKoii ?? 0) > MINIMUM_PUBLIC_BALANCE_TO_TRIGGER;

  useEffect(() => {
    if (!stakingAccountBalanceInKoii || !displayStakingAlerts) return;

    if (stakingAccountBalanceInKoii < CRITICAL_STAKING_ACCOUNT_BALANCE) {
      // show critical balance notification only once for the session
      const criticalBalanceNotificationShown = sessionStorage.getItem(
        'criticalBalanceNotificationShown'
      );

      if (criticalBalanceNotificationShown !== 'true') {
        showCriticalBalanceNotification();
      }

      sessionStorage.setItem('criticalBalanceNotificationShown', 'true');
    }

    /*     else if (
      stakingAccountBalanceInKoii <= LOW_STAKING_ACCOUNT_BALANCE &&
      (previousBalance === null ||
        previousBalance - stakingAccountBalanceInKoii >= 1)
    ) {
      addNotification(
        AppNotification.LowStakingAccountBalance,
        AppNotification.LowStakingAccountBalance,
        NotificationPlacement.TopBar
      );
      setPreviousBalance(stakingAccountBalanceInKoii);
    } */
  }, [
    stakingAccountBalanceInKoii,
    previousBalance,
    displayStakingAlerts,
    showCriticalBalanceNotification,
  ]);
};
