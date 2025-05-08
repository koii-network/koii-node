import { useQuery } from 'react-query';

import { QueryKeys, getStartedTasksPubKeys } from 'renderer/services';

export const useStartedTasksPubKeys = ({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) => {
  const startedTasksPubkeysQuery = useQuery(
    [QueryKeys.StartedTasksPubKeys],
    getStartedTasksPubKeys,
    {
      enabled,
    }
  );

  return startedTasksPubkeysQuery;
};
