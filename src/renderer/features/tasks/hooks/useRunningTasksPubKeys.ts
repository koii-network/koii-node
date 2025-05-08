import { useQuery } from 'react-query';

import { QueryKeys, getRunningTasksPubKeys } from 'renderer/services';

export const useRunningTasksPubKeys = ({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) => {
  const runningTasksPubkeysQuery = useQuery(
    [QueryKeys.RunningTasksPubKeys],
    getRunningTasksPubKeys,
    {
      enabled,
    }
  );

  return runningTasksPubkeysQuery;
};
