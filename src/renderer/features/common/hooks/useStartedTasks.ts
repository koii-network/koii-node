import { QueryKeys, fetchMyTasks } from 'renderer/services';

import { useTasksInfiniteScroll } from './useTaskInfiniteScroll';

type UseTasksInfiniteScrollParams = {
  pageSize: number;
  refetchInterval?: number;
  enabled?: boolean;
  staleTime?: number;
};

export const useStartedTasks = ({
  pageSize,
  refetchInterval,
  enabled,
  staleTime,
}: UseTasksInfiniteScrollParams) => {
  return useTasksInfiniteScroll({
    queryKey: QueryKeys.TaskList,
    pageSize,
    refetchInterval,
    fetchFunction: fetchMyTasks,
    enabled,
    staleTime,
  });
};
