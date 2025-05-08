import {
  QueryKeys,
  fetchAvailableTasks,
  fetchPrivateTasks,
} from 'renderer/services';

import { useTasksInfiniteScroll } from './useTaskInfiniteScroll';

type UseAvailableTasksParams = {
  pageSize: number;
  refetchInterval?: number;
  staleTime?: number;
  enablePrivateTasks?: boolean;
};

export const useAvailableTasks = ({
  pageSize,
  refetchInterval,
  staleTime,
  enablePrivateTasks,
}: UseAvailableTasksParams) => {
  const whitelistedTasksQuery = useTasksInfiniteScroll({
    queryKey: QueryKeys.availableTaskList,
    pageSize,
    refetchInterval,
    fetchFunction: fetchAvailableTasks,
    staleTime,
  });
  const privateTasksQuery = useTasksInfiniteScroll({
    queryKey: QueryKeys.PrivateTasks,
    pageSize,
    refetchInterval,
    fetchFunction: fetchPrivateTasks,
    staleTime,
    enabled: enablePrivateTasks,
  });

  return {
    whitelistedTasksQuery,
    privateTasksQuery,
  };
};
