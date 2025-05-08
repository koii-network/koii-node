import { useQuery } from 'react-query';

import { QueryKeys, TaskService } from 'renderer/services';
import { Task } from 'renderer/types';

interface Params {
  task: Task;
  stakingAccountPublicKey: string;
}

export const useUnstakingAvailability = ({
  task,
  stakingAccountPublicKey,
}: Params) => {
  const { data: canUnstake, isLoading: isLoadingUnstakingAvailability } =
    useQuery(
      [QueryKeys.UnstakingAvailability, task.publicKey, task.isRunning],
      async () =>
        TaskService.getUnstakingAvailability(task, stakingAccountPublicKey),
      {
        enabled: !!stakingAccountPublicKey,
      }
    );
  return {
    canUnstake,
    isLoadingUnstakingAvailability,
  };
};
