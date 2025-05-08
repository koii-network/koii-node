import { useEffect, useRef, useState } from 'react';

import { isFinite } from 'lodash';

const REWARD_EARNED_BANNER_DURATION = 6000;

export const usePreviousRewards = (pendingRewards?: Record<string, number>) => {
  const previousPendingRewardsRef = useRef<Record<string, number> | undefined>(
    undefined
  );
  const [newRewardsAvailable, setNewRewardsAvailable] = useState(false);

  useEffect(() => {
    if (previousPendingRewardsRef.current) {
      const hasNewReward = Object.entries(pendingRewards || {}).some(
        ([token, amount]) =>
          previousPendingRewardsRef.current?.[token] !== amount &&
          amount !== 0 &&
          isFinite(amount)
      );

      if (hasNewReward) {
        setNewRewardsAvailable(true);
        setTimeout(() => {
          setNewRewardsAvailable(false);
        }, REWARD_EARNED_BANNER_DURATION);
      }
    }
    previousPendingRewardsRef.current = pendingRewards;
  }, [pendingRewards]);

  return { newRewardsAvailable };
};
