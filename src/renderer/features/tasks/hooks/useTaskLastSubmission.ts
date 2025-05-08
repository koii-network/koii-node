import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { useAverageSlotTime } from 'renderer/features/common';
import { getLastSubmissionTime, QueryKeys } from 'renderer/services';

import { formatMilliseconds } from '../utils/utils';

export const useTaskLastSubmission = (
  stakingAccountPublicKey: string,
  taskPublicKey: string,
  roundTime: number
) => {
  const { data: averageSlotTime } = useAverageSlotTime();
  const GAP_BETWEEN_LAST_SUBMISSION_CHECKS =
    roundTime * (averageSlotTime || 420);
  const { data: lastSubInMilliseconds } = useQuery(
    [QueryKeys.LastSubRoundPerTask, stakingAccountPublicKey, taskPublicKey],
    () =>
      getLastSubmissionTime(
        taskPublicKey,
        stakingAccountPublicKey,
        averageSlotTime || 420
      ),
    {
      enabled: !!stakingAccountPublicKey && !!averageSlotTime,
      refetchInterval: GAP_BETWEEN_LAST_SUBMISSION_CHECKS,
      staleTime: GAP_BETWEEN_LAST_SUBMISSION_CHECKS,
    }
  );

  const lastSub = useMemo(
    () =>
      lastSubInMilliseconds ? formatMilliseconds(lastSubInMilliseconds) : 'N/A',
    [lastSubInMilliseconds]
  );

  return { lastSubmissionFormatted: lastSub, lastSubInMilliseconds };
};
