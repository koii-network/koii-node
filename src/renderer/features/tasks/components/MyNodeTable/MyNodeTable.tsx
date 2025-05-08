import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import Lottie from '@novemberfiveco/lottie-react-light';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import EmptyMyNode from 'assets/animations/empty-my-node.json';
import { BONUS_TASK_DEPLOYER, BONUS_TASK_NAME } from 'config/node';
import {
  MY_NODE_TASK_REFETCH_INTERVAL,
  MY_NODE_TASK_STALE_TIME,
} from 'config/refetchIntervals';
import { InfiniteScrollTable, LoadingSpinner } from 'renderer/components/ui';
import { useMyNodeContext } from 'renderer/features';
import { useStartedTasks } from 'renderer/features/common/hooks/useStartedTasks';
import { getMainAccountPublicKey, QueryKeys } from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';

import { MyNodeTaskRow } from '../MyNodeTaskRow';

const tableHeaders = [
  { title: 'Task Info', alignLeft: true },
  { title: 'Tags' },
  { title: 'Round Status' },
  { title: 'Rewards' },
  { title: 'Token' },
  { title: 'Menu' },
  { title: 'Run' },
];

const columnsLayout = 'grid-cols-my-node place-items-center';
const pageSize = 10;

export function MyNodeTable() {
  const tableRef = useRef<HTMLDivElement>(null);

  const { data: mainAccountPubKey, isLoading: isLoadingMainAccount } = useQuery(
    QueryKeys.MainAccount,
    getMainAccountPublicKey
  );

  const { fetchMyTasksEnabled } = useMyNodeContext();

  const {
    isFetchingNextTasks,
    isLoadingTasks,
    tasksError,
    hasMoreTasks,
    fetchNextTasks,
    allRows,
  } = useStartedTasks({
    pageSize,
    refetchInterval: MY_NODE_TASK_REFETCH_INTERVAL,
    staleTime: MY_NODE_TASK_STALE_TIME,
    enabled: fetchMyTasksEnabled,
  });

  const navigate = useNavigate();

  const [filterText, setFilterText] = useState('');

  const filteredTasks = allRows
    .filter(
      (task) =>
        task.publicKey.toLowerCase().includes(filterText.toLowerCase()) ||
        task.taskName.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      if (
        a.taskName === BONUS_TASK_NAME &&
        a.taskManager === BONUS_TASK_DEPLOYER
      )
        return -1;
      if (
        b.taskName === BONUS_TASK_NAME &&
        b.taskManager === BONUS_TASK_DEPLOYER
      )
        return 1;
      return 0;
    });

  const goToAvailableTasks = () => navigate(AppRoute.AddTask);
  const goToSettings = () => navigate(AppRoute.SettingsHelp);
  const thereAreNoTasks = !isLoadingTasks && !filteredTasks.length;

  const queryClient = useQueryClient();

  useEffect(() => {
    window.main.onSystemWakeUp(() => {
      queryClient.invalidateQueries([QueryKeys.TaskList]);
    });
  }, [queryClient]);

  const baseInputClassName =
    'px-6 py-2 w-[320px] text-sm rounded-md bg-finnieBlue-light-tertiary focus:ring-2 focus:ring-finnieTeal focus:outline-none focus:bg-finnieBlue-light-secondary text-white';

  return (
    <div ref={tableRef} className="relative flex flex-col flex-grow w-full h-0">
      <div className="absolute -top-20 left-52 flex flex-col justify-between items-start gap-1 mb-4 w-fit">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter by name or ID"
          className={baseInputClassName}
        />
      </div>
      <InfiniteScrollTable
        isFetchingNextPage={isFetchingNextTasks}
        columnsLayout={columnsLayout}
        headers={tableHeaders}
        minHeight="min-h-[500px]"
        isLoading={isLoadingTasks || isLoadingMainAccount}
        error={tasksError as Error}
        hasMore={!!hasMoreTasks}
        update={fetchNextTasks}
      >
        {isLoadingTasks && (
          <LoadingSpinner className="w-40 h-40 mx-auto mt-40" />
        )}

        {thereAreNoTasks && (
          <div className="flex flex-col items-center mx-auto text-sm text-white mt-14">
            <Lottie animationData={EmptyMyNode} className="w-66" />
            <p className="mb-4">
              {/* eslint-disable-next-line @cspell/spellchecker */}
              You are not running any tasks right now. Let&apos;s fix that!
            </p>
            <div className="flex flex-row">
              <Button
                onClick={goToAvailableTasks}
                variant={ButtonVariant.Secondary}
                size={ButtonSize.SM}
                label="Available Tasks"
                buttonClassesOverrides="!border-white !text-white mr-4"
              />
              <Button
                onClick={goToSettings}
                variant={ButtonVariant.Secondary}
                size={ButtonSize.SM}
                label="Need Help?"
                buttonClassesOverrides="!border-white !text-white ml-4"
              />
            </div>
          </div>
        )}

        {filteredTasks.map((task, index) => (
          <div key={task.publicKey}>
            <MyNodeTaskRow
              key={task.publicKey}
              index={index}
              task={task}
              accountPublicKey={mainAccountPubKey as string}
              columnsLayout={columnsLayout}
              isPrivate={!task.isWhitelisted}
              tableRef={tableRef}
            />
          </div>
        ))}
      </InfiniteScrollTable>
    </div>
  );
}
