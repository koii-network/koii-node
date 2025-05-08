import { useQuery } from 'react-query';

import { getCurrentSlot, QueryKeys } from 'renderer/services';
import { Task } from 'renderer/types';

export const useTaskRoundNumber = (task: Task) => {
  const { data: roundNumber } = useQuery(
    [QueryKeys.RoundTime, task.publicKey],
    async () => {
      const currentSlot = await getCurrentSlot();
      const currentRound = Math.floor(
        (currentSlot - task.startingSlot) / task.roundTime
      );

      return currentRound;
    },
    { refetchInterval: task.roundTime * 400 }
  );

  return roundNumber;
};
