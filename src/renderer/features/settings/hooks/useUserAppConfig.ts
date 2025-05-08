import { useCallback, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from 'react-query';

import { StoreUserConfigParam } from 'models/api';
import { getUserConfig, QueryKeys, saveUserConfig } from 'renderer/services';

type ParamsType = {
  onConfigSaveSuccess?: () => void;
};

export const useUserAppConfig = (options?: ParamsType) => {
  const { onConfigSaveSuccess } = options || {};
  const [isMutating, setIsMutating] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: userConfig,
    isLoading: isUserConfigLoading,
    error: userConfigError,
    refetch: refetchUserConfig,
  } = useQuery([QueryKeys.UserSettings], getUserConfig, {
    onSuccess: () => {
      if (isMutating) setIsMutating(false);
    },
  });

  const userConfigMutation = useMutation(
    async (config: Partial<StoreUserConfigParam>) => {
      setIsMutating(true);
      const currentUserConfig = (await getUserConfig()) || {};
      const newConfig: StoreUserConfigParam = {
        settings: {
          ...currentUserConfig,
          ...config.settings,
        },
      };

      await saveUserConfig(newConfig);
    },
    {
      onSuccess: () => {
        onConfigSaveSuccess?.();
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
      },
    }
  );

  const {
    mutate,
    mutateAsync,
    isLoading: isSavingUserConfig,
    error: saveUserConfigError,
  } = userConfigMutation;

  const handleSaveUserAppConfig = useCallback(
    (config: Partial<StoreUserConfigParam>) => {
      mutate(config);
    },
    [mutate]
  );

  const handleSaveUserAppConfigAsync = useCallback(
    async (config: Partial<StoreUserConfigParam>) => {
      return mutateAsync(config);
    },
    [mutateAsync]
  );

  return {
    isMutating,
    userConfig,
    handleSaveUserAppConfig,
    isUserConfigLoading,
    userConfigError,
    isSavingUserConfig,
    saveUserConfigError,
    refetchUserConfig,
    userConfigMutation,
    handleSaveUserAppConfigAsync,
  };
};
