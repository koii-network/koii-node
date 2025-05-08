import React, { ReactNode } from 'react';

import { ErrorMessage } from 'renderer/components/ui/ErrorMessage';
import {
  LoadingSpinner,
  LoadingSpinnerSize,
} from 'renderer/components/ui/LoadingSpinner';

import { TableHeaders, TableHeader, ColumnsLayout } from './TableHeaders';

type PropsType = {
  headers: TableHeader[];
  columnsLayout: ColumnsLayout;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | Error | null;
};

export function Table({
  headers,
  columnsLayout,
  children,
  isLoading,
  error,
}: PropsType) {
  if (isLoading)
    return (
      <div className="grid h-full place-items-center">
        <LoadingSpinner size={LoadingSpinnerSize.Large} />
      </div>
    );

  if (error)
    return (
      <div className="grid h-full place-items-center">
        <ErrorMessage error={error} className="-mt-10 text-base" />
      </div>
    );

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <TableHeaders headers={headers} columnsLayout={columnsLayout} />
      <div className="min-h-table">{children}</div>
    </div>
  );
}
