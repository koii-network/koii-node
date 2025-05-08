import { useEffect, useMemo } from 'react';

import { useDefaultTasks } from 'renderer/features/onboarding/hooks';

import { useTasksSelect } from './useTasksSelect';
import { useTaskStakeInputLogic } from './useTaskStakeInputLogic';

export const useRunFirstTasksLogic = () => {
  const {
    verifiedTasks,
    isLoading: loadingVerifiedTasks,
    error: verifiedTasksFetchError,
  } = useDefaultTasks();

  const { stakePerTask, totalStaked, handleStakeInputChange, setStakePerTask } =
    useTaskStakeInputLogic();

  const { selectedTasks, setFilteredTasksByKey, handleTaskRemove } =
    useTasksSelect({
      verifiedTasks,
    });

  const handleRestoreTasks = async () => {
    setStakePerTask({});
    setFilteredTasksByKey([]);
  };

  useEffect(() => {
    const pubKeyToStakeMap: Record<string, number> = {};
    selectedTasks.forEach((task) => {
      pubKeyToStakeMap[task.publicKey] = task.minimumStakeAmount;
    });
    setStakePerTask(pubKeyToStakeMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTasks]);

  const selectedTasksWithStake = useMemo(
    () =>
      selectedTasks.map((task) => {
        const minStake = task.minimumStakeAmount;

        return {
          ...task,
          stake: stakePerTask[task.publicKey] ?? minStake,
          minStake,
        };
      }),
    [selectedTasks]
  );

  return {
    selectedTasks: selectedTasksWithStake,
    loadingVerifiedTasks,
    verifiedTasksFetchError,
    totalStaked,
    stakePerTask,
    handleRestoreTasks,
    handleTaskRemove,
    handleStakeInputChange,
  };
};
