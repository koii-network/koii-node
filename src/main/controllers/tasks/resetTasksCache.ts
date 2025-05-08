import { clearAllTaskCaches } from 'main/services/tasks-cache-utils';

export const resetNodeCache = async (): Promise<void> => {
  await clearAllTaskCaches();
};
