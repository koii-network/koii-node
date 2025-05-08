import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';

import { Task } from 'models';
import { LoadingSpinner } from 'renderer/components/ui';
import { QueryKeys, stopTask } from 'renderer/services';

type VariablesConflictViewProps = {
  tasksPairedWithVariables: Record<string, { name: string; tasks: Task[] }>;
  taskName: string;
  onIgnore: () => void;
};

export function VariablesConflictView({
  tasksPairedWithVariables,
  taskName,
  onIgnore,
}: VariablesConflictViewProps) {
  const [isPausing, setIsPausing] = useState(false);

  const variablesInConflict = Object.entries(tasksPairedWithVariables || {})
    .filter(([_, info]) => info.tasks.length > 0)
    .map(([id, info]) => ({
      id,
      name: info.name,
      tasks: info.tasks,
    }));

  const conflictingTasks = [
    ...new Set(
      variablesInConflict.flatMap((v) => v.tasks.map((t) => t.data.taskName))
    ),
  ];

  const queryCache = useQueryClient();

  const handlePauseConflicting = async () => {
    setIsPausing(true);
    try {
      const tasksToStop = variablesInConflict.flatMap((v) => v.tasks);
      const uniqueTasksToStopByPubkey = [
        ...new Map(tasksToStop.map((task) => [task.publicKey, task])).values(),
      ];

      for (const task of uniqueTasksToStopByPubkey) {
        await stopTask(task.publicKey);
      }

      onIgnore();
    } catch (error) {
      console.error('Failed to pause conflicting tasks:', error);
    } finally {
      await queryCache.invalidateQueries([QueryKeys.TaskList]);
      await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
      queryCache.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === QueryKeys.TasksPairedWithVariable,
      });
      setIsPausing(false);
    }
  };

  const buttonClasses = '!transition-all !duration-300 ease-in-out w-[250px]';

  return (
    <div className="flex flex-col gap-8 m-4">
      <div className="flex flex-col gap-4">
        <p>You tried to start a task with variables that are already in use:</p>

        <div className="flex flex-wrap gap-2">
          {variablesInConflict.map(({ name }) => (
            <span
              key={name}
              className="px-3 py-1 rounded-full bg-finnieBlue-light text-white"
            >
              {name}
            </span>
          ))}
        </div>

        <p>
          These variables are currently being used by:{' '}
          <span className="font-bold">{conflictingTasks.join(', ')}</span>
        </p>

        <p className="text-finnieRed-light">
          Consider pausing the conflicting{' '}
          {conflictingTasks.length > 1 ? 'tasks' : 'task'} before starting{' '}
          <span className="font-bold">{taskName}</span>
        </p>
      </div>

      <div className="flex justify-between gap-4 w-full">
        <Button
          onClick={onIgnore}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.SM}
          label="Ignore warning"
          buttonClassesOverrides="!transition-all !duration-300 ease-in-out w-[250px]"
          labelClassesOverrides="mx-auto"
        />
        {isPausing ? (
          <div className="w-[150px] h-12 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.SM}
            label="Pause conflicting tasks"
            buttonClassesOverrides={buttonClasses}
            labelClassesOverrides="mx-auto"
            onClick={handlePauseConflicting}
          />
        )}
      </div>
    </div>
  );
}
