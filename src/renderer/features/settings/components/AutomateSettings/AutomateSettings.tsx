import React from 'react';

import { TasksScheduler } from 'renderer/features/tasks-scheduler';

import { SectionHeader } from '../SectionHeader';

export function AutomateSettings() {
  return (
    <div>
      <SectionHeader title="Automate Node" />
      <TasksScheduler />
    </div>
  );
}
