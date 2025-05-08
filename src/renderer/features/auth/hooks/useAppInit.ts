import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { QueryKeys, initializeTasks } from 'renderer/services';

import { usePrefetchAppData } from './usePrefetchAppData';

const NODE_INITIALIZATION_TIMEOUT = 8000;

export function useAppInit() {
  const queryClient = useQueryClient();

  usePrefetchAppData();

  const { userConfig: settings, isUserConfigLoading: loadingSettings } =
    useUserAppConfig();

  const initializeNodeCalled = useRef(false);

  const [initializingNode, setInitializingNode] = useState(true);

  useEffect(() => {
    const initializeNode = async () => {
      if (initializeNodeCalled.current) {
        return; // If already called, skip the initialization
      }
      initializeNodeCalled.current = true;
      console.log('Initializing node...');
      try {
        initializeTasks().then(() => {
          queryClient.invalidateQueries([QueryKeys.TaskList]);
        });
        setTimeout(() => {
          setInitializingNode(false);
        }, NODE_INITIALIZATION_TIMEOUT);
      } catch (error) {
        console.error((error as { message: string }).message);
        /**
         * If the initialization fails, we should not keep the user stuck in the
         * initialization screen. Instead, we should allow the user to enter the app.
         */
        setInitializingNode(false);
      }
    };

    const shouldInitializeNode =
      !loadingSettings && settings?.hasFinishedTheMainnetMigration;

    if (shouldInitializeNode) {
      initializeNode();
    } else {
      setInitializingNode(false);
    }
  }, [loadingSettings, settings?.hasFinishedTheMainnetMigration, queryClient]);

  return {
    initializingNode,
  };
}
