import { useCallback, useMemo } from 'react';
import { QueryClient, useQuery } from 'react-query';

import { QueryKeys } from 'renderer/services';

export function useMyTaskStake(
  taskAccountPubKey: string,
  taskType: 'KOII' | 'KPL' = 'KOII',
  shouldCache = true,
  revalidate = false
) {
  const queryClient = useMemo(() => new QueryClient(), []);

  const { data, isLoading, error } = useQuery(
    [QueryKeys.TaskStake, taskAccountPubKey, taskType, shouldCache],
    () => {
      return window.main.getMyTaskStake({
        taskAccountPubKey,
        shouldCache,
        revalidate,
        taskType,
      });
    },
    {
      enabled: !!taskAccountPubKey,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const refetchWithRevalidate = useCallback(async () => {
    const newStakestake = await window.main.getMyTaskStake({
      taskAccountPubKey,
      revalidate: true,
      taskType,
    });

    queryClient.setQueryData([QueryKeys.TaskStake, taskAccountPubKey], () => {
      return newStakestake;
    });
  }, [queryClient, taskAccountPubKey]);

  return { data, isLoading, error, refetch: refetchWithRevalidate };
}
