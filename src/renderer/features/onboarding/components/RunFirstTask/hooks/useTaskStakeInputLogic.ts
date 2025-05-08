import { useMemo, useState } from 'react';

export const useTaskStakeInputLogic = () => {
  const [stakePerTask, setStakePerTask] = useState<Record<string, number>>({});

  const handleStakeInputChange = (newStake: number, taskPubKey: string) => {
    setStakePerTask({
      ...stakePerTask,
      [taskPubKey]: newStake,
    });
  };

  const totalStaked = useMemo(
    () => Object.values(stakePerTask).reduce((acc, curr) => acc + curr, 0),
    [stakePerTask]
  );

  return { stakePerTask, handleStakeInputChange, setStakePerTask, totalStaked };
};
