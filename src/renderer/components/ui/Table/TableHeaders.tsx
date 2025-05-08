import React from 'react';

import { Tooltip } from 'renderer/components/ui/Tooltip';

export interface TableHeader {
  title: string;
  tooltip?: string;
  alignLeft?: boolean;
}

export type ColumnsLayout = `grid-cols-${string}`;

interface PropsType {
  headers: TableHeader[];
  columnsLayout: ColumnsLayout;
}

export function TableHeaders({ headers, columnsLayout }: PropsType) {
  const containerClasses = `grid pb-2 font-semibold leading-5 text-sm text-white border-b-2 border-white ${columnsLayout}`;

  return (
    <div className={containerClasses}>
      {headers.map(({ title, tooltip, alignLeft }, index) => (
        <div
          key={`${title}${index}`}
          className={`font-semibold text-white ${
            alignLeft ? 'justify-self-start' : ''
          }`}
        >
          {tooltip ? (
            <Tooltip placement="top-right" tooltipContent={tooltip}>
              {title}
            </Tooltip>
          ) : (
            title
          )}
        </div>
      ))}
    </div>
  );
}
