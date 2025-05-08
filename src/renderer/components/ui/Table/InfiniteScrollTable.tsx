import React, { ReactNode, RefCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { twMerge } from 'tailwind-merge';

import { LoadingSpinner, LoadingSpinnerSize } from '../LoadingSpinner';

import { Table } from './Table';
import { ColumnsLayout, TableHeader } from './TableHeaders';

interface PropsType {
  animationRef?: RefCallback<HTMLDivElement>;
  isFetchingNextPage: boolean;
  headers: TableHeader[];
  columnsLayout: ColumnsLayout;
  minHeight?: string;
  children: ReactNode[];
  update: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  error?: Error | null;
  items?: number;
  privateUpdate?: () => void;
  privateHasMore?: boolean;
  privateIsFetchingNextPage?: boolean;
}

export function InfiniteScrollTable({
  animationRef,
  isFetchingNextPage,
  headers,
  columnsLayout,
  minHeight,
  children,
  update,
  hasMore,
  isLoading,
  error,
  items,
  privateUpdate,
  privateHasMore,
  privateIsFetchingNextPage,
}: PropsType) {
  const { ref: tableBottomRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !isLoading) {
      if (hasMore && !isFetchingNextPage) {
        console.log('🔄 Auto-loading next whitelisted page');
        update();
      }
      if (privateHasMore && !privateIsFetchingNextPage && privateUpdate) {
        console.log('🔄 Auto-loading next private page');
        privateUpdate();
      }
    }
  }, [
    inView,
    hasMore,
    privateHasMore,
    isFetchingNextPage,
    privateIsFetchingNextPage,
    isLoading,
    update,
    privateUpdate,
    children.length,
  ]);

  const showLoader =
    hasMore ||
    isFetchingNextPage ||
    (privateHasMore && privateIsFetchingNextPage);

  const loaderClasses = twMerge(
    'w-fit mx-auto scale-75',
    showLoader ? '' : 'hidden'
  );

  const containerClasses = twMerge(
    'flex flex-col',
    minHeight || 'min-h-[440px]'
  );

  return (
    <Table headers={headers} columnsLayout={columnsLayout} error={error}>
      <div ref={animationRef} className={containerClasses}>
        <div>{children}</div>
        <div ref={tableBottomRef} className="relative h-4 my-8">
          <div className={loaderClasses}>
            <LoadingSpinner size={LoadingSpinnerSize.Large} />
          </div>
        </div>
      </div>
    </Table>
  );
}
