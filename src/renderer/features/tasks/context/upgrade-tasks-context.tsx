import React, { createContext, useCallback, useMemo, useState } from 'react';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { useMainAccount } from 'renderer/features/settings/hooks/useMainAccount';
import { QueryKeys } from 'renderer/services';
import { Task } from 'renderer/types';
import { getKoiiFromRoe } from 'utils';

enum UpgradeStatus {
  UP_TO_DATE = 'UP_TO_DATE',
  UPGRADE_AVAILABLE = 'UPGRADE_AVAILABLE',
  PRIVATE_UPGRADE_AVAILABLE = 'PRIVATE_UPGRADE_AVAILABLE',
  PRIVATE_UPGRADE_WARNING = 'PRIVATE_UPGRADE_WARNING',
  NEW_VERSION_BEING_AUDITED = 'NEW_VERSION_BEING_AUDITED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IS_CONFIRMING_UPGRADE = 'IS_CONFIRMING_UPGRADE',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export type TaskUpgradeMutationParams = {
  newStake: number;
  useStakingWalletForStake: boolean;
  taskPublicKey: string;
  newTaskVersion?: Task;
  setUpgradeStatus: (status: UpgradeStatus) => void;
  tokenType: string;
};

type TaskStartingPromise = Promise<void>;

interface UpgradeTasksContext {
  upgradeTask: UseMutateFunction<
    unknown,
    unknown,
    TaskUpgradeMutationParams,
    unknown
  >;
  getUpgradePromise: (taskPublicKey: string) => TaskStartingPromise | undefined;
  getStatusFromContext: (taskPublicKey: string) => UpgradeStatus | undefined;
  removeUpgradeStatus: (taskPublicKey: string) => void;
  isUpgradingTask: boolean;
}

const Ctx = createContext<UpgradeTasksContext | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function UpgradeTasksProvider({ children }: PropsType) {
  const [upgradeStatuses, setUpgradeStatuses] = useState<
    Record<string, UpgradeStatus>
  >({});
  const [upgradePromises, setUpgradePromises] = useState<
    Record<string, TaskStartingPromise>
  >({});
  const { data: mainAccountPublicKey } = useMainAccount();

  const queryClient = useQueryClient();

  const isUpgradingTask = !!Object.values(upgradePromises)?.length;

  const { mutate: upgradeTask } = useMutation(
    ({
      taskPublicKey,
      newStake,
      newTaskVersion,
      useStakingWalletForStake,
      tokenType,
    }: TaskUpgradeMutationParams) => {
      const stakeInKoii = getKoiiFromRoe(newStake);
      return window.main.upgradeTask({
        oldPublicKey: taskPublicKey,
        newPublicKey: newTaskVersion?.publicKey || '',
        newStake: stakeInKoii,
        useStakingWalletForStake,
        tokenType,
      });
    },
    {
      onMutate: async ({ taskPublicKey }) => {
        setUpgradePromises({
          ...upgradePromises,
          [taskPublicKey]: upgradeTask as unknown as TaskStartingPromise,
        });
        setUpgradeStatuses((upgradeStatuses) => ({
          ...upgradeStatuses,
          [taskPublicKey]: UpgradeStatus.IN_PROGRESS,
        }));
      },
      onSuccess: async (_, { taskPublicKey }) => {
        setUpgradeStatuses((upgradeStatuses) => ({
          ...upgradeStatuses,
          [taskPublicKey]: UpgradeStatus.SUCCESS,
        }));
        setTimeout(async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [taskPublicKey]: removedStatus, ...remainingStatuses } =
            upgradeStatuses;
          setUpgradeStatuses(remainingStatuses);
          await queryClient.invalidateQueries([QueryKeys.TaskList]);
        }, 7500);
      },
      onError: (_, { taskPublicKey }) => {
        setUpgradeStatuses((upgradeStatuses) => ({
          ...upgradeStatuses,
          [taskPublicKey]: UpgradeStatus.ERROR,
        }));
      },
      onSettled: (_, _1, { taskPublicKey }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [taskPublicKey]: removedPromise, ...remainingPromises } =
          upgradePromises;
        setUpgradePromises(remainingPromises);
        queryClient.invalidateQueries([
          QueryKeys.MainAccountBalance,
          mainAccountPublicKey,
        ]);
        queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
        queryClient.invalidateQueries([
          QueryKeys.KplBalanceList,
          mainAccountPublicKey,
        ]);
      },
      retry: 3,
    }
  );

  const removeUpgradeStatus = useCallback(
    (taskPublicKey: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [taskPublicKey]: removedStatus, ...remainingStatuses } =
        upgradeStatuses;
      setUpgradeStatuses(remainingStatuses);
    },
    [upgradeStatuses]
  );

  const getUpgradePromise = useCallback(
    (publicKey: string) => {
      return upgradePromises[publicKey];
    },
    [upgradePromises]
  );

  const getStatusFromContext = useCallback(
    (publicKey: string) => {
      return upgradeStatuses[publicKey];
    },
    [upgradeStatuses]
  );

  const value = useMemo(
    () => ({
      upgradeTask,
      getUpgradePromise,
      getStatusFromContext,
      removeUpgradeStatus,
      isUpgradingTask,
    }),
    [
      upgradeTask,
      getUpgradePromise,
      getStatusFromContext,
      removeUpgradeStatus,
      isUpgradingTask,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUpgradeTasksContext() {
  const context = React.useContext(Ctx);
  if (!context) {
    throw new Error(
      'useStartingTasksContext must be used inside StartingTasksProvider'
    );
  }
  return context;
}
