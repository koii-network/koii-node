import { useQuery } from 'react-query';

import { checkAppUpdate } from 'renderer/services';

export const useUpdateCheck = () => {
  const {
    data: updateAvailable,
    refetch: checkForUpdates,
    isLoading: isCheckingForTheUpdate,
  } = useQuery('checkAppUpdate', checkAppUpdate, {
    retry: false, // Disable auto retry
    enabled: false, // Don't automatically run on mount
  });

  return {
    updateInfo: updateAvailable?.updateInfo,
    checkForUpdates,
    isCheckingForTheUpdate,
  };
};
