import { useAutoAnimate } from '@formkit/auto-animate/react';
import React from 'react';

import { useTaskVariable } from 'renderer/features/common/hooks/useTaskVariable';

import { TaskVariableItem } from './TaskVariableItem';

export function ManageYourTools() {
  const { storedTaskVariables } = useTaskVariable();

  const [parent] = useAutoAnimate();

  const arrayOfStoredVariables = Object.entries(storedTaskVariables).map(
    ([id, { label, value }]) => ({ id, label, value })
  );

  return (
    <div className="flex flex-col gap-4 text-sm flex-grow min-h-0">
      <span className="text-2xl font-semibold text-left">
        Manage your Tools
      </span>

      <div
        ref={parent}
        className="flex flex-col gap-5 flex-grow min-h-0 overflow-y-auto"
      >
        {arrayOfStoredVariables.map((taskVariable) => (
          <TaskVariableItem
            key={taskVariable.label}
            taskVariable={taskVariable}
          />
        ))}
      </div>
    </div>
  );
}
