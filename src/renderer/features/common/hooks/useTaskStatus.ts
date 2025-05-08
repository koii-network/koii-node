import { useQuery } from 'react-query';

import { QueryKeys, TaskService } from 'renderer/services';
import { Task, TaskStatus } from 'renderer/types';

import { usePrivateTasks } from '../../tasks';

interface Params {
  task: Task;
  stakingAccountPublicKey: string;
}

export const useTaskStatus = ({ task, stakingAccountPublicKey }: Params) => {
  const { privateTasksQuery } = usePrivateTasks();

  const {
    data: taskStatus = TaskStatus.PRE_SUBMISSION,
    isLoading: isLoadingStatus,
    error,
  } = useQuery(
    [QueryKeys.TaskStatus, task.publicKey, task.isRunning],
    () =>
      TaskService.getStatus(
        task,
        stakingAccountPublicKey,
        !!privateTasksQuery.data?.includes(task.publicKey)
      ),
    {
      enabled: !!stakingAccountPublicKey && !privateTasksQuery.isLoading,
      staleTime: 4 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  return {
    taskStatus,
    isLoadingStatus,
    statusError: error,
  };
};
