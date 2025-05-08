import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { RequirementType } from 'models';
import {
  useAllStoredPairedTaskVariables,
  useUserAppConfig,
} from 'renderer/features';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import { useMetadata } from 'renderer/features/tasks';
import {
  QueryKeys,
  TaskService,
  getTaskPairedVariablesNamesWithLabels,
} from 'renderer/services';
import { Task } from 'renderer/types';
import { getKoiiFromRoe } from 'utils';

import {
  TaskUpgradeMutationParams,
  useUpgradeTasksContext,
} from '../context/upgrade-tasks-context';

import { useMyTaskStake } from './useMyTaskStake';

export enum UpgradeStatus {
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

interface Params {
  task: Task;
  oldTaskIsPrivate: boolean;
  oldTaskIsCoolingDown: boolean;
}

export const useUpgradeTask = ({
  task,
  oldTaskIsPrivate,
  oldTaskIsCoolingDown,
}: Params) => {
  const hasNotifiedUpgrade = useRef(false);

  const { addAppNotification: showUpgradeTaskNotification } =
    useAppNotifications('TASK_UPGRADE');
  const initialStatus = task.isMigrated
    ? UpgradeStatus.UPGRADE_AVAILABLE
    : UpgradeStatus.UP_TO_DATE;
  const [upgradeStatus, setUpgradeStatus] =
    useState<UpgradeStatus>(initialStatus);

  const getLatestActiveVersionOfTask = async (
    taskPublicKey: string
  ): Promise<Task> => {
    const newTaskState = await window.main.getTaskInfo({
      taskAccountPubKey: taskPublicKey,
    });

    if (newTaskState.isActive) {
      console.log(`UPGRADE TASK: the new version ${taskPublicKey} is active`);
      const newTask = { ...newTaskState, publicKey: taskPublicKey };

      return newTask;
    } else if (newTaskState.isMigrated) {
      console.log(
        `UPGRADE TASK: task ${taskPublicKey} has been migrated to ${newTaskState.migratedTo}`
      );
      const newerTaskState = await getLatestActiveVersionOfTask(
        newTaskState.migratedTo
      );

      return newerTaskState;
    } else {
      console.log(
        `UPGRADE TASK: the latest version of the task ${taskPublicKey} is not active`
      );
      throw new Error('The latest version of this task is not active');
    }
  };

  const { data: newTaskVersion, isLoading: isLoadingNewTaskVersion } = useQuery(
    [QueryKeys.NewTaskVersion, task.publicKey, task.isMigrated],
    () => {
      return getLatestActiveVersionOfTask(task.migratedTo);
    },
    {
      enabled: task.isMigrated,
      staleTime: 15 * 60 * 1000,
    }
  );

  const {
    storedPairedTaskVariablesQuery: {
      data: allPairedVariables = {},
      isLoading: isLoadingNewTaskVersionPairedVariables,
    },
  } = useAllStoredPairedTaskVariables();

  const newTaskVersionPairedVariables = Object.entries(
    Object.entries(allPairedVariables).filter(
      ([taskId]) => taskId === newTaskVersion?.publicKey
    )[0]?.[1] || {}
  ).map(([key, value]) => ({ [key]: value }));

  const {
    data: newTaskVersionPairedVariablesWithLabel = [],
    // isLoading: isLoadingNewTaskVersionPairedVariables,
  } = useQuery(
    [QueryKeys.StoredTaskPairedTaskVariables, newTaskVersion?.publicKey],
    () =>
      getTaskPairedVariablesNamesWithLabels(newTaskVersion?.publicKey || ''),
    { enabled: !!newTaskVersion?.publicKey }
  );

  const {
    metadata: newTaskVersionMetadata,
    isLoadingMetadata: isLoadingNewTaskVersionMetadata,
  } = useMetadata({
    metadataCID: newTaskVersion?.metadataCID,
    taskPublicKey: newTaskVersion?.publicKey || 'newTaskVersionPubKeyMissing',
    queryOptions: { enabled: !!newTaskVersion },
  });

  const newTaskVersionVariables = (
    newTaskVersionMetadata?.requirementsTags?.filter(({ type }) =>
      [RequirementType.TASK_VARIABLE, RequirementType.GLOBAL_VARIABLE].includes(
        type
      )
    ) || []
  ).map(({ value, type, retrievalInfo }) => ({
    name: value || '',
    value: value || '',
    type: type || '',
    retrievalInfo,
    label: 'ㅤ',
  }));

  const { data: newTaskVersionStake } = useMyTaskStake(
    task.publicKey,
    task.taskType
  );

  const newTaskVersionNodes = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => TaskService.getNodesCount(newTaskVersion!),
    [newTaskVersion]
  );
  const newTaskVersionTopStake = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => TaskService.getTopStake(newTaskVersion!),
    [newTaskVersion]
  );
  const newTaskVersionTotalBountyInKoii = getKoiiFromRoe(
    newTaskVersion?.totalBountyAmount || 0
  );
  const newTaskVersionMinStake = getKoiiFromRoe(
    newTaskVersion?.minimumStakeAmount || 0
  );
  const newTaskVersionDetails = {
    nodesNumber: newTaskVersionNodes,
    minStake: newTaskVersionMinStake,
    topStake: getKoiiFromRoe(newTaskVersionTopStake),
    bounty: newTaskVersionTotalBountyInKoii,
    roundTime: newTaskVersion?.roundTime,
  };

  const { handleSaveUserAppConfig, userConfig } = useUserAppConfig({});

  const handleNotifyUpgradeAvailable = useCallback(() => {
    if (hasNotifiedUpgrade.current) return;

    const taskIsReadyToUpgrade =
      !oldTaskIsCoolingDown &&
      newTaskVersion &&
      userConfig &&
      [
        UpgradeStatus.UPGRADE_AVAILABLE,
        UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE,
      ].includes(upgradeStatus);
    if (taskIsReadyToUpgrade) {
      const tasksThatAlreadyNotifiedUpgradesAvailable =
        userConfig?.tasksThatAlreadyNotifiedUpgradesAvailable || [];
      const hasNotified = tasksThatAlreadyNotifiedUpgradesAvailable.includes(
        newTaskVersion?.publicKey || ''
      );
      if (!hasNotified) {
        showUpgradeTaskNotification({ taskName: task.taskName });
        handleSaveUserAppConfig({
          settings: {
            tasksThatAlreadyNotifiedUpgradesAvailable: [
              ...tasksThatAlreadyNotifiedUpgradesAvailable,
              newTaskVersion.publicKey,
            ],
          },
        });
        hasNotifiedUpgrade.current = true;
      }
    }
  }, [
    oldTaskIsCoolingDown,
    newTaskVersion,
    userConfig,
    upgradeStatus,
    showUpgradeTaskNotification,
    task.taskName,
    handleSaveUserAppConfig,
  ]);

  useEffect(() => {
    handleNotifyUpgradeAvailable();
  }, [handleNotifyUpgradeAvailable]);

  useEffect(() => {
    if (
      task.isMigrated &&
      newTaskVersion &&
      upgradeStatus === UpgradeStatus.UP_TO_DATE
    ) {
      setUpgradeStatus(UpgradeStatus.UPGRADE_AVAILABLE);
    }
  }, [task.isMigrated, newTaskVersion, upgradeStatus]);

  useEffect(() => {
    const newTaskVersionIsPrivate = newTaskVersion?.isWhitelisted === false;
    if (newTaskVersionIsPrivate) {
      const newUpgradeStatus = oldTaskIsPrivate
        ? UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE
        : UpgradeStatus.NEW_VERSION_BEING_AUDITED;
      setUpgradeStatus(newUpgradeStatus);
    }
  }, [newTaskVersion?.isWhitelisted, oldTaskIsPrivate]);

  const {
    upgradeTask,
    getStatusFromContext,
    removeUpgradeStatus: removeContextUpgradeStatus,
  } = useUpgradeTasksContext();

  const upgradeTaskFunction = (args: TaskUpgradeMutationParams) => {
    upgradeTask({
      ...args,
      setUpgradeStatus,
      tokenType: task.tokenType || '',
    });
  };

  return {
    upgradeStatus: (getStatusFromContext(task.publicKey)
      ? getStatusFromContext(task.publicKey)
      : newTaskVersion
      ? upgradeStatus
      : UpgradeStatus.UP_TO_DATE) as UpgradeStatus,
    setUpgradeStatus: (status: UpgradeStatus) => {
      removeContextUpgradeStatus(task.publicKey);
      setUpgradeStatus(status);
    },
    upgradeTask: upgradeTaskFunction as (
      params: Omit<TaskUpgradeMutationParams, 'setUpgradeStatus'>
    ) => void,
    newTaskVersion,
    isLoadingNewTaskVersion,
    newTaskVersionMetadata,
    isLoadingNewTaskVersionMetadata,
    newTaskVersionVariables,
    newTaskVersionPairedVariables,
    newTaskVersionPairedVariablesWithLabel,
    isLoadingNewTaskVersionPairedVariables,
    newTaskVersionDetails,
    newTaskVersionStake,
  };
};
