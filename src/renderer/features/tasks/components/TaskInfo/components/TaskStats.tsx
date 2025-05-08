import React from 'react';

import { StatBox } from './StatBox';

export type TaskStat = {
  label: string;
  value?: string | number;
  fullValue?: string | number;
};

type PropsType = {
  taskStatistics: TaskStat[];
};

export function TaskStats({ taskStatistics }: PropsType) {
  return (
    <div className="flex flex-wrap gap-3">
      {taskStatistics.map(({ label, value, fullValue }) => (
        <StatBox
          key={label}
          label={label}
          value={value}
          fullValue={fullValue}
        />
      ))}
    </div>
  );
}
