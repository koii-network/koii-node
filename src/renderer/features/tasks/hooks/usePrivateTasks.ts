import { useQuery } from 'react-query';

import {
  getRunnedPrivateTasks,
  setRunnedPrivateTasks,
} from 'renderer/services/api';

export const usePrivateTasks = () => {
  const privateTasksQuery = useQuery(['privateTasks'], getRunnedPrivateTasks);

  const isTaskPrivateAsync = async (taskId: string): Promise<boolean> => {
    try {
      const privateTasks = await privateTasksQuery.refetch();

      return !!privateTasks.data?.includes(taskId);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const addPrivateTask = (taskId: string) => {
    return setRunnedPrivateTasks(taskId);
  };

  return {
    privateTasksQuery,
    addPrivateTask,
    isTaskPrivateAsync,
  };
};
