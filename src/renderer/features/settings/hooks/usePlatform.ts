import { useQuery } from 'react-query';

import { getPlatform } from 'renderer/services';

export const usePlatformCheck = () => {
  const { data: platformData, refetch: refetchPlatform } = useQuery(
    'checkPlatform',
    getPlatform,
    {
      retry: false, // Disable auto retry
      enabled: false, // Don't automatically run on mount
    }
  );

  return {
    platformInfo: platformData,
    refetchPlatform,
  };
};
