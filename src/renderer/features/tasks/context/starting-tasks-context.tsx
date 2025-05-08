import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

import { TaskType } from 'models';
import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import { addTaskToScheduler, QueryKeys, startTask } from 'renderer/services';

import { useStakeOnTask } from '../hooks/useStakeOnTask';

type StartTaskArgs = {
  publicKey: string;
  stakePotAccount: string;
  valueToStake: number;
  alreadyStakedTokensAmount?: number | null;
  isPrivate?: boolean;
  isUsingNetworking: boolean;
  taskType?: TaskType;
  mintAddress?: string;
};

type TaskStartingPromise = Promise<void>;

interface TasksContext {
  executeTask: (args: StartTaskArgs) => Promise<void>;
  getIsTaskLoading: (publicKey: string) => boolean;
  getTaskStartPromise: (publicKey: string) => TaskStartingPromise;
}

const Ctx = createContext<TasksContext | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function StartingTasksProvider({ children }: PropsType) {
  const [startTaskPromises, setStartTaskPromises] = useState<
    Record<string, TaskStartingPromise>
  >({});
  const { data: mainAccountPublicKey } = useMainAccount();
  const stakeOnTaskMutation = useStakeOnTask({ skipIfItIsAlreadyStaked: true });

  const queryClient = useQueryClient();

  const runTask = useCallback(
    async ({
      publicKey,
      alreadyStakedTokensAmount,
      valueToStake,
      isPrivate,
      isUsingNetworking,
      stakePotAccount,
      taskType,
      mintAddress,
    }: StartTaskArgs) => {
      /**
       * @dev: task stake can be zero, if nothing is staked yet.
       */

      if (alreadyStakedTokensAmount === 0) {
        await stakeOnTaskMutation.mutateAsync({
          taskAccountPubKey: publicKey,
          stakeAmount: valueToStake,
          isNetworkingTask: isUsingNetworking,
          stakePotAccount,
          taskType,
          mintAddress,
        });
      }

      await startTask(publicKey, isPrivate, true);
    },
    [stakeOnTaskMutation]
  );

  const executeTask = useCallback(
    async (args: StartTaskArgs) => {
      const { publicKey } = args;
      const taskPromise = runTask(args)
        .then(async () => {
          setTimeout(() => {
            queryClient.invalidateQueries([QueryKeys.availableTaskList]);
            queryClient.invalidateQueries([QueryKeys.TaskList]);
          }, 8000);
          // enable scheduler by default
          await addTaskToScheduler(publicKey);
        })
        .finally(async () => {
          await queryClient.invalidateQueries(QueryKeys.OrcaPodman);
          await queryClient.invalidateQueries([QueryKeys.TaskList]);
          await queryClient.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
          queryClient.removeQueries({
            predicate: (query) =>
              query.queryKey[0] === QueryKeys.TasksPairedWithVariable,
          });
          // delete promise when it's done
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [publicKey]: removedKey, ...remainingPromises } =
            startTaskPromises;
          setStartTaskPromises(remainingPromises);
          // revalidate scheduler tasks cache
          queryClient.invalidateQueries([QueryKeys.SchedulerTasks, publicKey]);
          queryClient.invalidateQueries([
            QueryKeys.MainAccountBalance,
            mainAccountPublicKey,
          ]);
          queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
          queryClient.invalidateQueries([
            QueryKeys.KplBalanceList,
            mainAccountPublicKey,
          ]);
        });

      setStartTaskPromises({
        ...startTaskPromises,
        [publicKey]: taskPromise,
      });
    },
    [mainAccountPublicKey, queryClient, runTask, startTaskPromises]
  );

  const getTaskStartPromise = useCallback(
    (publicKey: string) => {
      return startTaskPromises[publicKey];
    },
    [startTaskPromises]
  );

  const getIsTaskLoading = useCallback(
    (publicKey: string) => {
      return !!startTaskPromises[publicKey];
    },
    [startTaskPromises]
  );

  const value = useMemo(
    () => ({
      executeTask,
      getIsTaskLoading,
      getTaskStartPromise,
    }),
    [executeTask, getIsTaskLoading, getTaskStartPromise]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStartingTasksContext() {
  const context = React.useContext(Ctx);
  if (!context) {
    throw new Error(
      'useStartingTasksContext must be used inside StartingTasksProvider'
    );
  }
  return context;
}
