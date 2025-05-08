import { useMemo } from 'react';

import { ParsedRoundTime, parseRoundTime } from 'renderer/utils';

type Params = {
  roundTimeInMs: number;
  averageSlotTime?: number;
};

export const useTaskRoundTime = ({
  roundTimeInMs,
  averageSlotTime,
}: Params): ParsedRoundTime => {
  return useMemo(() => {
    if (!averageSlotTime) {
      return {
        value: 0,
        unit: 's',
      };
    }

    return parseRoundTime(roundTimeInMs * averageSlotTime);
  }, [averageSlotTime, roundTimeInMs]);
};
