import { useQuery } from 'react-query';

import { QueryKeys, getTaskVariablesNames } from 'renderer/services';

type UseTaskVariablesParams = {
  taskPubKey: string;
};

export const useTaskVariablesNames = ({
  taskPubKey,
}: UseTaskVariablesParams) => {
  const taskVariablesNamesQuery = useQuery<string[]>(
    [QueryKeys.TaskVariablesNames, taskPubKey],
    () => getTaskVariablesNames(taskPubKey),
    {
      enabled: !!taskPubKey,
      staleTime: Infinity,
    }
  );

  return { taskVariablesNamesQuery };
};
