import { UseQueryOptions, useQuery } from 'react-query';

import { QueryKeys, getTasksById } from 'renderer/services';
import { Task } from 'renderer/types';

type TaskByIdParams = {
  taskPubkey: string;
  options?: Omit<
    UseQueryOptions<Task | null, unknown, Task | null, string[]>,
    'queryKey' | 'queryFn'
  >;
};

const getTaskById = async (taskPubKey: string) => {
  const data = await getTasksById([taskPubKey]);

  if (data.length > 0) {
    return data[0];
  }

  return null;
};

export const useTaskById = ({ taskPubkey, options }: TaskByIdParams) => {
  const taskByIdQuery = useQuery(
    [QueryKeys.PrivateTask, taskPubkey],
    () => getTaskById(taskPubkey),
    {
      onError(error) {
        console.error(error);
      },
      ...options,
    }
  );

  return taskByIdQuery;
};
