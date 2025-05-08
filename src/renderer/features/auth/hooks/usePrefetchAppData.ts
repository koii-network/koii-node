import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import {
  fetchKPLList,
  getAllAccounts,
  getKPLBalance,
  getUserConfig,
  QueryKeys,
} from 'renderer/services';

export function usePrefetchAppData() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const { data: mainAccountPublicKey } = useMainAccount();

  useEffect(() => {
    const prefetchQueries = async () => {
      try {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.UserSettings],
            queryFn: getUserConfig,
          }),
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.Accounts],
            queryFn: getAllAccounts,
          }),
          queryClient.prefetchQuery({
            queryKey: QueryKeys.KplList,
            queryFn: fetchKPLList,
          }),
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.KplBalanceList, mainAccountPublicKey],
            queryFn: () => getKPLBalance(mainAccountPublicKey || ''),
          }),
        ]);
        setLoading(false);
        setError(undefined);
      } catch (error: any) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    prefetchQueries();
  }, [queryClient, mainAccountPublicKey]);

  return {
    error,
    loading,
  };
}
