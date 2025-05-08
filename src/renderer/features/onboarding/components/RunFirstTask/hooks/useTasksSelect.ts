import { useMemo, useState } from 'react';

import { Task } from 'renderer/types';

type ParamsType = {
  verifiedTasks: Task[];
};

export const useTasksSelect = ({ verifiedTasks = [] }: ParamsType) => {
  const [filteredTasksByKey, setFilteredTasksByKey] = useState<string[]>([]);

  const handleTaskRemove = (taskPubKey: string) => {
    const filteredKeys = [...filteredTasksByKey, taskPubKey];
    setFilteredTasksByKey(filteredKeys);
  };

  const selectedTasks = useMemo(
    () =>
      verifiedTasks?.filter((task) => {
        return !filteredTasksByKey.includes(task.publicKey);
      }),
    [filteredTasksByKey, verifiedTasks]
  );

  return {
    setFilteredTasksByKey,
    handleTaskRemove,
    selectedTasks,
  };
};
