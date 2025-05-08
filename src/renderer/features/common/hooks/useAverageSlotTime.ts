import { useQuery } from 'react-query';

import { AVERAGE_SLOT_TIME_DEFAULT_STALE_TIME } from 'config/refetchIntervals';
import { getAverageSlotTime, QueryKeys } from 'renderer/services';

export const useAverageSlotTime = ({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) => {
  return useQuery([QueryKeys.AverageSlotTime], getAverageSlotTime, {
    staleTime: AVERAGE_SLOT_TIME_DEFAULT_STALE_TIME,
    refetchInterval: AVERAGE_SLOT_TIME_DEFAULT_STALE_TIME,
    enabled,
  });
};
