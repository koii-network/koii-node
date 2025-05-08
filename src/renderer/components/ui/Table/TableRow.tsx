import React, { MouseEventHandler, ReactNode, forwardRef } from 'react';

import { ColumnsLayout } from './TableHeaders';

interface Props {
  children: ReactNode;
  columnsLayout: ColumnsLayout;
  className?: string;
  onClick?: MouseEventHandler;
}

export const TableRow = forwardRef<HTMLDivElement, Props>(
  ({ children, columnsLayout, className = '', onClick }, ref) => {
    const classes = `relative grid text-white items-center text-sm border-white/10 border-b border-px align-middle transition-all duration-200 items-center 
      before:absolute before:inset-0 before:transition-all before:duration-200 before:pointer-events-none hover:before:bg-white/[0.03] hover:before:shadow-lg
      ${className} ${columnsLayout}`;

    return (
      <div ref={ref} className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }
);

TableRow.displayName = 'TableRow';
