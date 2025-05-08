import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { RunningPrivateTasks } from 'models';
import { QueryKeys } from 'renderer/services';
import { startTask, stopTask } from 'renderer/services/api';
import { Task } from 'renderer/types';
import { wait } from 'utils/wait';

export const useOrcaTasksActions = (
  orcaTasks?: Task[],
  privateTasks: RunningPrivateTasks = []
) => {
  const queryClient = useQueryClient();

  const startOrcaTasksMutation = useMutation(
    async () => {
      if (!orcaTasks || orcaTasks.length === 0) return;
      await Promise.all(
        orcaTasks.map((task) => {
          const isPrivate = privateTasks.includes(task.publicKey);
          return startTask(task.publicKey, isPrivate);
        })
      );
      await wait(8000);
    },
    {
      onSuccess: () => {
        toast.success('Initialized Orca tasks startup');
        queryClient.invalidateQueries([QueryKeys.myTaskList]);
      },
      onError: (error) => {
        console.log('Starting tasks failed. Try Again', error);
        toast.error('Starting tasks failed. Try Again');
      },
    }
  );

  const stopOrcaTasksMutation = useMutation(
    async () => {
      if (!orcaTasks || orcaTasks.length === 0) return;
      await Promise.all(orcaTasks.map((task) => stopTask(task.publicKey)));
      await wait(8000);
    },
    {
      onSuccess: () => {
        toast.success('Shuting down Orca tasks');
        queryClient.invalidateQueries([QueryKeys.myTaskList]);
      },
      onError: (error) => {
        console.log('Stopping tasks failed. Try Again', error);
        toast.error('Stopping tasks failed. Try Again');
      },
    }
  );

  return {
    startOrcaTasks: startOrcaTasksMutation.mutate,
    stopOrcaTasks: stopOrcaTasksMutation.mutate,
    isLoading:
      startOrcaTasksMutation.isLoading || stopOrcaTasksMutation.isLoading,
  };
};
