import { Icon, WarningTriangleFill } from '@_koii/koii-styleguide';
import React from 'react';

type PropsType = {
  taskWarning: string;
};

export function PrivateTaskWarning({ taskWarning }: PropsType) {
  return (
    <div className="flex items-center gap-2 pt-2 pl-4 text-xs text-orange-2">
      <Icon source={WarningTriangleFill} size={16} className="ml-[1px]" />
      {taskWarning}
    </div>
  );
}
