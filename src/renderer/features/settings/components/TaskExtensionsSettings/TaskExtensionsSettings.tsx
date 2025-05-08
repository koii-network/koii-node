import React from 'react';

import { SectionHeader } from '../SectionHeader';
import { Spacer } from '../Spacer';
import {
  AddTaskVariable,
  ManageYourTools,
  TaskVariableHelper,
} from '../TaskSettings';

import { AddOnsList } from './Addons';

// import { AddOnsList } from './Addons';

export function TaskExtensionsSettings() {
  return (
    <div className="overflow-y-auto text-white">
      <SectionHeader title="Task Extensions" />
      <AddTaskVariable />
      <Spacer showSeparator />
      <TaskVariableHelper />
      <Spacer showSeparator />
      <div className="flex flex-col gap-6 2xl:flex-row 2xl:gap-20">
        <ManageYourTools />

        <AddOnsList />
      </div>
    </div>
  );
}
