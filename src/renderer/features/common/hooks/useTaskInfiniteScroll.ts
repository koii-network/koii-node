import { useMemo } from 'react';
import { InfiniteData, useInfiniteQuery } from 'react-query';

import { GetMyTasksParam, PaginatedResponse } from 'models';
import { QueryKeys } from 'renderer/services';
import { Task } from 'renderer/types';

type UseTasksInfiniteScrollParams = {
  queryKey: QueryKeys;
  pageSize: number;
  refetchInterval?: number;
  fetchFunction: (params: GetMyTasksParam) => Promise<PaginatedResponse<Task>>;
  enabled?: boolean;
  onSuccess?: (data: InfiniteData<PaginatedResponse<Task>>) => void;
  staleTime?: number;
};

export const useTasksInfiniteScroll = ({
  queryKey,
  pageSize,
  refetchInterval,
  fetchFunction,
  enabled = true,
  onSuccess,
  staleTime = 0,
}: UseTasksInfiniteScrollParams) => {
  const {
    isLoading: isLoadingTasks,
    data: tasks,
    error: tasksError,
    fetchNextPage: fetchNextTasks,
    hasNextPage: hasMoreTasks,
    isFetchingNextPage: isFetchingNextTasks,
    refetch: refetchTasks,
  } = useInfiniteQuery(
    [queryKey],
    ({ pageParam = 0 }) => {
      return fetchFunction({ limit: pageSize, offset: pageParam * pageSize });
    },
    {
      refetchInterval: refetchInterval || false,
      getNextPageParam: (lastResponse, allPages) => {
        const hasMore = lastResponse.hasNext;
        const nextPage = allPages.length;
        return hasMore ? nextPage : undefined;
      },
      enabled,
      onSuccess(data) {
        onSuccess?.(data);
      },
      staleTime,
      cacheTime: Infinity,
    }
  );

  const allRows: Task[] = useMemo(
    () => (tasks?.pages || []).map(({ content }) => content).flat(),
    [tasks?.pages]
  );

  return {
    isLoadingTasks,
    tasks,
    allRows,
    tasksError,
    fetchNextTasks,
    hasMoreTasks,
    isFetchingNextTasks,
    refetchTasks,
  };
};
