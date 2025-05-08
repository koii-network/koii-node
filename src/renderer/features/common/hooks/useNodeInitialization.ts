import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { useUserAppConfig } from 'renderer/features/settings/hooks';
import {
  getAllAccounts,
  getUserConfig,
  initializeTasks,
  QueryKeys,
} from 'renderer/services';

export function useNodeInitialization() {
  const queryClient = useQueryClient();
  const { userConfig: settings, isUserConfigLoading: loadingSettings } =
    useUserAppConfig();
  const initializeNodeCalled = useRef(false);

  const prefetchQueries = useCallback(async () => {
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
      ]);
    } catch (error: any) {
      console.error(error);
    }
  }, [queryClient]);

  const initializeNode = async () => {
    if (initializeNodeCalled.current) {
      return;
    }
    initializeNodeCalled.current = true;
    console.log('Initializing node...');
    try {
      await prefetchQueries();
      await initializeTasks();
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };
  const { isLoading: initializingNode, error: nodeInitializationError } =
    useQuery([QueryKeys.InitializingNode], initializeNode, {
      enabled: !!settings?.hasFinishedTheMainnetMigration && !loadingSettings,
      retry: 3,
      cacheTime: 0,
      staleTime: Infinity,
    });

  return {
    initializingNode,
    nodeSettings: settings,
    nodeInitializationError,
  };
}
