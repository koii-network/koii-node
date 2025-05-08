import { useQuery } from 'react-query';

import { DesktopNodeVariableID, Task, TaskId, TaskPairing } from 'models';
import { useRunningTasksPubKeys } from 'renderer/features/tasks/hooks/useRunningTasksPubKeys';
import { getTasksPairedWithVariable, QueryKeys } from 'renderer/services';

type VariableInfo = {
  name: string;
  tasks: Task[];
};

export const useTasksConsumingVariables = ({
  pairedVariables,
  taskId,
  enabled,
}: {
  pairedVariables: TaskPairing;
  taskId: TaskId;
  enabled?: boolean;
}) => {
  const { data: runningTasksPubkeys, isLoading: loadingRunningTasksPubKeys } =
    useRunningTasksPubKeys({
      enabled,
    });

  const {
    data: tasksPairedWithVariables,
    isLoading: loadingTasksPairedWithVariables,
  } = useQuery<Record<DesktopNodeVariableID, VariableInfo>>(
    [QueryKeys.TasksPairedWithVariable, taskId],
    async () => {
      const entries = Object.entries(pairedVariables);
      const results = await entries.reduce(async (accPromise, [name, id]) => {
        const acc = await accPromise;
        const tasksWithThisVariablePaired = (
          await getTasksPairedWithVariable(id)
        ).filter(
          (task) =>
            task.publicKey !== taskId &&
            runningTasksPubkeys?.includes(task.publicKey)
        );

        if (tasksWithThisVariablePaired.length === 0) return acc;

        return [
          ...acc,
          {
            id,
            name,
            tasks: tasksWithThisVariablePaired,
          },
        ];
      }, Promise.resolve([] as Array<{ id: DesktopNodeVariableID; name: string; tasks: Task[] }>));

      return Object.fromEntries(
        results.map(({ id, name, tasks }) => [id, { name, tasks }])
      );
    },
    { enabled: enabled && !!runningTasksPubkeys }
  );

  const isLoadingTasksConsumingVariables =
    loadingRunningTasksPubKeys || loadingTasksPairedWithVariables;

  return {
    tasksPairedWithVariables,
    isLoadingTasksConsumingVariables,
  };
};
