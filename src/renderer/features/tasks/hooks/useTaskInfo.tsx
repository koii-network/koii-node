import { useQuery } from 'react-query';

import { getTaskInfo, QueryKeys } from 'renderer/services';

export const useTaskInfo = (taskPublicKey: string) => {
  const {
    data: taskInfoData,
    isLoading: taskInfoLoading,
    error: taskInfoError,
  } = useQuery({
    queryKey: [QueryKeys.TaskInfo, taskPublicKey],
    queryFn: () => getTaskInfo(taskPublicKey),
  });

  return {
    taskInfoData,
    taskInfoLoading,
    taskInfoError,
  };
};
