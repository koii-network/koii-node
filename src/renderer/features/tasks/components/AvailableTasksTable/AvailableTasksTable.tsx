import { useAutoAnimate } from '@formkit/auto-animate/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import EmptyAvailableTasks from 'assets/animations/empty-available-tasks.gif';
import { BONUS_TASK_DEPLOYER, BONUS_TASK_NAME } from 'config/node';
import {
  AVAILABLE_TASKS_REFETCH_INTERVAL,
  AVAILABLE_TASKS_STALE_TIME,
} from 'config/refetchIntervals';
import {
  InfiniteScrollTable,
  LoadingSpinner,
  Switch,
} from 'renderer/components/ui';
import { useAvailableTasks, useUserAppConfig } from 'renderer/features';
import { Task } from 'renderer/types';

import { AdvancedOptions } from '../AdvancedOptions/AdvancedOptions';
import TaskItem from '../AvailableTaskRow/AvailableTaskRow';

const tableHeaders = [
  { title: 'Task Info', alignLeft: true },
  { title: 'Tags' },
  { title: 'Rewards' },
  { title: 'Token' },
  { title: 'Stake' },
  { title: 'Extensions' },
  { title: 'Run' },
];

const columnsLayout = 'grid-cols-available-tasks place-items-center';
const addPrivateTaskColumnsLayout =
  'grid-cols-add-private-task place-items-center';
const pageSize = 5;

export function AvailableTasksTable() {
  const { userConfig, userConfigMutation } = useUserAppConfig({});
  const { data: brandingConfig, isLoading: isLoadingBrandingConfig } = useQuery(
    'brandingConfig',
    window.main.getBrandingConfig
  );
  const shouldDisplayPrivateTasks =
    userConfig?.shouldDisplayPrivateTasks || false;
  const shouldDisplayKoiiEcosystemCheckbox =
    !!brandingConfig?.organizationKPLTokenAddress;
  const shouldDisplayBroaderKoiiEcosystemTasks =
    userConfig?.shouldDisplayBroaderKoiiEcosystemTasks || false;

  const toggleDisplayPrivateTasks = () => {
    userConfigMutation.mutate({
      settings: {
        shouldDisplayPrivateTasks: !shouldDisplayPrivateTasks,
      },
    });
  };

  const toggleDisplayKoiiEcosystemCheckbox = () => {
    userConfigMutation.mutate({
      settings: {
        shouldDisplayBroaderKoiiEcosystemTasks:
          !shouldDisplayBroaderKoiiEcosystemTasks,
      },
    });
  };

  const {
    whitelistedTasksQuery: {
      allRows: whitelistedTasks,
      isLoadingTasks: isLoadingWhitelistedTasks,
      isFetchingNextTasks: isFetchingNextWhitelistedTasks,
      tasksError: whitelistedTasksError,
      hasMoreTasks: hasMoreWhitelistedTasks,
      fetchNextTasks: fetchNextWhitelistedTasks,
    },
    privateTasksQuery: {
      allRows: privateTasks,
      isLoadingTasks: isLoadingPrivateTasks,
      isFetchingNextTasks: isFetchingNextPrivateTasks,
      tasksError: privateTasksError,
      hasMoreTasks: hasMorePrivateTasks,
      fetchNextTasks: fetchNextPrivateTasks,
    },
  } = useAvailableTasks({
    pageSize,
    refetchInterval: AVAILABLE_TASKS_REFETCH_INTERVAL,
    staleTime: AVAILABLE_TASKS_STALE_TIME,
    enablePrivateTasks: shouldDisplayPrivateTasks,
  });

  const [animationRef] = useAutoAnimate();
  const [filterText, setFilterText] = useState('');

  const filterAndSortTasks = (tasks: Task[]) => {
    return tasks
      .filter(
        (task) =>
          (task.publicKey.toLowerCase().includes(filterText.toLowerCase()) ||
            task.taskName.toLowerCase().includes(filterText.toLowerCase())) &&
          (!shouldDisplayKoiiEcosystemCheckbox ||
            shouldDisplayBroaderKoiiEcosystemTasks ||
            task.tokenType === brandingConfig?.organizationKPLTokenAddress)
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
  };

  const filteredWhitelistedTasks = filterAndSortTasks(whitelistedTasks);
  const filteredPrivateTasks = filterAndSortTasks(privateTasks);

  const thereAreNoTasks =
    !isLoadingWhitelistedTasks &&
    !isFetchingNextWhitelistedTasks &&
    !hasMoreWhitelistedTasks &&
    (!shouldDisplayPrivateTasks || !hasMorePrivateTasks) &&
    !filteredWhitelistedTasks.length &&
    !filteredPrivateTasks.length &&
    !isLoadingBrandingConfig;

  const showLoader =
    (isLoadingWhitelistedTasks ||
      isFetchingNextWhitelistedTasks ||
      isLoadingBrandingConfig) &&
    !filteredWhitelistedTasks.length &&
    !filteredPrivateTasks.length;

  const baseInputClassName =
    'px-6 py-2 w-[320px] text-sm rounded-md bg-finnieBlue-light-tertiary focus:ring-2 focus:ring-finnieTeal focus:outline-none focus:bg-finnieBlue-light-secondary text-white';

  return (
    <div className="relative flex flex-col flex-grow w-full h-0 min-h-0">
      {!isLoadingBrandingConfig && (
        <div className="absolute -top-20 left-52 flex flex-col justify-between items-start gap-1 mb-4 w-fit">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by name or ID"
            className={baseInputClassName}
          />
          <div className="flex justify-start items-start mb-4 w-fit -ml-7 mt-0">
            <motion.div
              key="private-switch"
              className="relative"
              initial={{ opacity: 0, y: -20, scale: 0.75 }}
              animate={{ opacity: 1, y: 0, scale: 0.75 }}
              exit={{ opacity: 0, y: -20, scale: 0.75 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                id="private-tasks"
                isChecked={!!shouldDisplayPrivateTasks}
                onSwitch={toggleDisplayPrivateTasks}
                label="Show non-verified tasks"
              />
            </motion.div>
            {shouldDisplayKoiiEcosystemCheckbox && (
              <motion.div
                key="koii-ecosystem-switch"
                className="relative -ml-10"
                initial={{ opacity: 0, y: -20, scale: 0.75 }}
                animate={{ opacity: 1, y: 0, scale: 0.75 }}
                exit={{ opacity: 0, y: -20, scale: 0.75 }}
                transition={{ duration: 0.2 }}
              >
                <Switch
                  id="koii-ecosystem-tasks"
                  isChecked={shouldDisplayBroaderKoiiEcosystemTasks}
                  onSwitch={toggleDisplayKoiiEcosystemCheckbox}
                  label="Show other Koii ecosystem tasks"
                />
              </motion.div>
            )}
          </div>
        </div>
      )}

      <InfiniteScrollTable
        animationRef={animationRef}
        isFetchingNextPage={isFetchingNextWhitelistedTasks}
        columnsLayout={columnsLayout}
        headers={tableHeaders}
        isLoading={isLoadingWhitelistedTasks || isLoadingBrandingConfig}
        error={whitelistedTasksError as Error}
        hasMore={!!hasMoreWhitelistedTasks}
        update={fetchNextWhitelistedTasks}
        privateHasMore={shouldDisplayPrivateTasks && !!hasMorePrivateTasks}
        privateUpdate={fetchNextPrivateTasks}
        privateIsFetchingNextPage={isFetchingNextPrivateTasks}
        items={filteredWhitelistedTasks.length + filteredPrivateTasks.length}
      >
        {showLoader && <LoadingSpinner className="w-40 h-40 mx-auto mt-40" />}

        {!isLoadingBrandingConfig && (
          <>
            {thereAreNoTasks && (
              <div className="flex items-center justify-center w-full h-full text-white">
                <div className="w-[363px] h-[363px] flex flex-col justify-center items-center">
                  <img src={EmptyAvailableTasks} alt="No available tasks" />
                  <div className="text-center mt-[18px] text-sm">
                    You are running all tasks that are currently available for
                    your device. More tasks are added all the time, so check
                    back soon!
                  </div>
                </div>
              </div>
            )}

            {filteredWhitelistedTasks.map((task) => (
              <TaskItem
                isPrivate={false}
                columnsLayout={columnsLayout}
                key={task.publicKey}
                task={task}
              />
            ))}

            {shouldDisplayPrivateTasks &&
              filteredPrivateTasks.map((task) => (
                <TaskItem
                  isPrivate
                  columnsLayout={columnsLayout}
                  key={task.publicKey}
                  task={task}
                />
              ))}
          </>
        )}
      </InfiniteScrollTable>
      <AdvancedOptions columnsLayout={addPrivateTaskColumnsLayout} />
    </div>
  );
}
