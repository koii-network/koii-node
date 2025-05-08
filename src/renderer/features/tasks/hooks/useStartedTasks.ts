import { useAtom } from 'jotai';

import { useTasksInfiniteScroll } from 'renderer/features/common/hooks/useTaskInfiniteScroll';
import { QueryKeys, fetchMyTasks } from 'renderer/services';

import { selectedTasksAtom } from '../state';
import { joinPaginatedResponseContent } from '../utils/utils';

type UseTasksInfiniteScrollParams = {
  pageSize: number;
  refetchInterval?: number;
  enabled?: boolean;
};

export const useStartedTasks = ({
  pageSize,
  refetchInterval,
  enabled,
}: UseTasksInfiniteScrollParams) => {
  const [, setData] = useAtom(selectedTasksAtom);

  return useTasksInfiniteScroll({
    queryKey: QueryKeys.TaskList,
    pageSize,
    refetchInterval,
    fetchFunction: fetchMyTasks,
    enabled,
    onSuccess(data) {
      const flattenData = joinPaginatedResponseContent(data);
      setData(flattenData);
    },
  });
};
