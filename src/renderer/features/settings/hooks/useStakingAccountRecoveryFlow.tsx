import { useRef } from 'react';
import { useQuery } from 'react-query';

import { useAppNotifications } from 'renderer/features/notifications/hooks/useAppNotifications';
import { getKPLStakingAccountPubKey, QueryKeys } from 'renderer/services';

import { useStakingAccount } from './useStakingAccount';

interface Params {
  isEnabled?: boolean;
  shouldNotify?: boolean;
  stakingPublicKey?: string;
  isKPLStakingAccount?: boolean;
}

export const useStakingAccountRecoveryFlow = ({
  isEnabled = true,
  shouldNotify = true,
  stakingPublicKey,
  isKPLStakingAccount = false,
}: Params) => {
  const { data: activeStakingPublicKey } = useStakingAccount();
  const { data: activeKPLStakingPublicKey, error: kplStakingKeyError } =
    useQuery(QueryKeys.KPLStakingAccount, getKPLStakingAccountPubKey, {
      retry: false,
      enabled: isKPLStakingAccount,
    });
  const stakingKeyToEvaluate =
    stakingPublicKey ||
    (isKPLStakingAccount ? activeKPLStakingPublicKey : activeStakingPublicKey);
  const { addAppNotification: notifyAboutStakingKeyMessedUp } =
    useAppNotifications('STAKING_KEY_MESSED_UP');
  const { addAppNotification: notifyAboutKPLStakingKeyMessedUp } =
    useAppNotifications('KPL_STAKING_KEY_MESSED_UP');
  const hasNotified = useRef(false);

  const notify = isKPLStakingAccount
    ? notifyAboutKPLStakingKeyMessedUp
    : notifyAboutStakingKeyMessedUp;

  const verifyStakingKeyOwnership = async () => {
    try {
      if (stakingKeyToEvaluate) {
        const stakingKeyIsMessedUp =
          await window.main.checkIfStakingAccountIsFaulty({
            stakingPublicKey: stakingKeyToEvaluate,
            isKPLStakingAccount,
          });
        if (stakingKeyIsMessedUp) {
          if (shouldNotify && !hasNotified.current) {
            notify();
            hasNotified.current = true;
          }
          return true;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const { data: stakingKeyIsMessedUp } = useQuery(
    ['stakingKeyIsMessedUp', stakingKeyToEvaluate, shouldNotify],
    verifyStakingKeyOwnership,
    {
      enabled: isEnabled && !!stakingKeyToEvaluate,
      refetchInterval: 10 * 60 * 1000,
    }
  );

  return { stakingKeyIsMessedUp };
};
