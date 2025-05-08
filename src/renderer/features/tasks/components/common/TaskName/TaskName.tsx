import React from 'react';
import { twMerge } from 'tailwind-merge';

import { OrcaTag } from '../../OrcaTag';

export function TaskName({
  taskName,
  className,
  isUsingOrca,
}: {
  taskName: string;
  className?: string;
  isUsingOrca?: boolean;
}) {
  const wrapperClasses = twMerge(
    'flex flex-col text-sm lg:text-base md2:text-[1.18rem] font-semibold justify-self-start max-w-[120px] xl:max-w-[180px] md2:max-w-[200px]',
    className
  );
  return (
    <div className={wrapperClasses}>
      <div className="overflow-hidden truncate whitespace-nowrap">
        {taskName}
        {isUsingOrca && <OrcaTag />}
      </div>
    </div>
  );
}
