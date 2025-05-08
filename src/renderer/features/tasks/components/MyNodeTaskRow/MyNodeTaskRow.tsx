import { Icon, PauseFill, PlayFill } from '@_koii/koii-styleguide';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import React, {
  MouseEventHandler,
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

import ArrowIcon from 'assets/svgs/chevron-no-circle.svg';
import RetryAnim from 'assets/svgs/history-icon.svg';
import SurpriseBoxes from 'assets/svgs/surprise-boxes.svg';
import UpdateIcon from 'assets/svgs/update-icon.svg';
import {
  BONUS_TASK_DEPLOYER,
  BONUS_TASK_NAME,
  MAX_TASK_RETRY_TIME,
} from 'config/node';
import {
  TASK_RETRY_DATA_REFETCH_INTERVAL,
  TASK_RETRY_DATA_STALE_TIME,
} from 'config/refetchIntervals';
import { get, noop, uniqBy } from 'lodash';
import { RequirementType, TaskPairing } from 'models';
import {
  Button,
  ColumnsLayout,
  LoadingSpinner,
  LoadingSpinnerSize,
  Placement,
  TableRow,
} from 'renderer/components/ui';
import { DROPDOWN_MENU_ID } from 'renderer/components/ui/Dropdown/Dropdown';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import {
  useMetadata,
  useMyNodeContext,
  useStakingAccount,
} from 'renderer/features';
import {
  useAddStakeModal,
  useAddTaskVariableModal,
  useConfirmRunTask,
  useOnClickOutside,
  useTaskStatus,
  useUnstakeModal,
  useUnstakingAvailability,
} from 'renderer/features/common';
import { useAutoPairVariables } from 'renderer/features/common/hooks/useAutoPairVariables';
import {
  TaskInfo,
  TaskStatsDataType,
} from 'renderer/features/tasks/components/TaskInfo';
import { TaskSettings } from 'renderer/features/tasks/components/TaskSettings';
import { useKplToken } from 'renderer/features/tokens/hooks/useKplToken';
import {
  QueryKeys,
  TaskService,
  cancelTaskRetry,
  getAllTimeRewards,
  getIsTaskRunning,
  getKPLStakingAccountPubKey,
  getRetryDataByTaskId,
  getTaskPairedVariablesNamesWithLabels,
  openLogfileFolder,
  startTask,
  stopTask,
} from 'renderer/services';
import { Task, TaskStatus } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { getBestTooltipPosition, getKoiiFromRoe } from 'utils';

import useCountDown from '../../hooks/useCountDown';
import { useMyTaskStake } from '../../hooks/useMyTaskStake';
import { useTaskLastSubmission } from '../../hooks/useTaskLastSubmission';
import { useTaskRoundNumber } from '../../hooks/useTaskRoundNumber';
import { useTaskStatsData } from '../../hooks/useTaskStatsData';
import { UpgradeStatus, useUpgradeTask } from '../../hooks/useUpgradeTask';
import { isOrcaTask } from '../../utils';
import { getTooltipContent } from '../../utils/utils';
import { useTaskThumbnail } from '../AvailableTaskRow/useTaskThumbnail';
import { StatusBar } from '../StatusBar';
import {
  ConfirmUpgradeContent,
  NewVersionInAudit,
  PrivateUpgradeWarning,
  UpgradeFailedContent,
  UpgradeInProgressContent,
  UpgradeSucceededContent,
} from '../taskUpgrade';

import { CurrencyDisplay } from './components/CurrencyDisplay';
import { Options } from './components/Options';
import { RewardsCell } from './components/RewardsCell';
import { Tags } from './components/Tags';
import { Thumbnail } from './components/Thumbnail';
import { Token } from './components/Token';

type PropsType = {
  task: Task;
  accountPublicKey: string;
  index: number;
  columnsLayout: ColumnsLayout;
  isPrivate: boolean;
  tableRef: RefObject<HTMLDivElement>;
};

export function MyNodeTaskRow({
  task,
  accountPublicKey,
  index,
  columnsLayout,
  isPrivate,
  tableRef,
}: PropsType) {
  const [isArchivingTask, setIsArchivingTask] = useState(false);
  const [accordionView, setAccordionView] = useState<
    'info' | 'upgrade-info' | 'upgrade-settings' | null
  >(null);
  const [shouldDisplayActions, setShouldDisplayActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hideTooltip, setHideTooltip] = useState(false);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState(0);
  const [isAddTaskSettingModalOpen, setIsAddTaskSettingModalOpen] =
    useState(false);
  const [isTaskSettingsValid, setIsTaskSettingsValid] = useState(false);
  const queryCache = useQueryClient();
  const { fetchMyTasksEnabled } = useMyNodeContext();

  const { taskName, isRunning: originalIsRunning, publicKey, roundTime } = task;

  const { data: alternativeIsRunning = false } = useQuery(
    [QueryKeys.IsRunning, publicKey],
    () => getIsTaskRunning(publicKey),
    {
      enabled: !fetchMyTasksEnabled,
    }
  );

  const { data: taskRetryData = null } = useQuery(
    [QueryKeys.TaskRetryData, publicKey],
    () => getRetryDataByTaskId(publicKey),
    {
      refetchInterval: TASK_RETRY_DATA_REFETCH_INTERVAL,
      staleTime: TASK_RETRY_DATA_STALE_TIME,
    }
  );

  // while claiming rewards we disable updates to tasks in My Node,
  // this workaround allows us to update the play/pause state if the user plays/pauses the task
  const isRunning = fetchMyTasksEnabled
    ? originalIsRunning
    : alternativeIsRunning;

  const { showModal: showAddTaskSettingModal } = useAddTaskVariableModal();

  const { data: taskStake } = useMyTaskStake(task.publicKey, task.taskType);

  const { kplToken, isLoading: isLoadingKplToken } = useKplToken({
    tokenType: task.tokenType || '',
  });

  const { data: stakingAccountPublicKey = '' } = useStakingAccount();
  const { data: kplStakingAccountPublicKey = '' } = useQuery(
    QueryKeys.KPLStakingAccount,
    getKPLStakingAccountPubKey
  );
  const correspondingStakingKey = useMemo(
    () =>
      task.taskType === 'KPL'
        ? kplStakingAccountPublicKey
        : stakingAccountPublicKey,
    [task.taskType, kplStakingAccountPublicKey, stakingAccountPublicKey]
  );

  const { taskStatus, isLoadingStatus } = useTaskStatus({
    task: { ...task, isRunning },
    stakingAccountPublicKey: correspondingStakingKey,
  });

  const { canUnstake } = useUnstakingAvailability({
    task,
    stakingAccountPublicKey: correspondingStakingKey,
  });

  const myStakeInKoii = taskStake && getKoiiFromRoe(taskStake);

  const isCoolingDown = useMemo(
    () => !canUnstake && !!myStakeInKoii,
    [canUnstake, myStakeInKoii]
  );

  const {
    upgradeStatus,
    upgradeTask,
    setUpgradeStatus,
    newTaskVersion,
    isLoadingNewTaskVersion,
    newTaskVersionVariables,
    newTaskVersionPairedVariables,
    isLoadingNewTaskVersionPairedVariables,
    newTaskVersionPairedVariablesWithLabel,
    newTaskVersionMetadata,
    isLoadingNewTaskVersionMetadata,
    newTaskVersionDetails,
    newTaskVersionStake,
  } = useUpgradeTask({
    task,
    oldTaskIsPrivate: isPrivate,
    oldTaskIsCoolingDown: isCoolingDown,
  });

  useAutoPairVariables({
    taskPublicKey: newTaskVersion?.publicKey || '',
    taskVariables: newTaskVersionVariables,
  });

  const isBountyEmpty = task.totalBountyAmount < task.bountyAmountPerRound;
  useEffect(() => {
    getAllTimeRewards(task.publicKey).then((reward) => {
      setClaimedRewards(reward);
    });
    const pendingRewards =
      TaskService.getPendingRewardsByTask(task, correspondingStakingKey) || 0;
    setPendingRewards(pendingRewards);
  }, [task, correspondingStakingKey]);

  const { metadata, isLoadingMetadata } = useMetadata({
    metadataCID: task.metadataCID,
    taskPublicKey: task.publicKey,
  });

  const isLoadingMetadataFlag =
    accordionView === 'upgrade-info'
      ? isLoadingNewTaskVersionMetadata
      : isLoadingMetadata;

  const oldTaskVersionVariables = metadata?.requirementsTags.filter(
    ({ type }) =>
      [RequirementType.TASK_VARIABLE, RequirementType.GLOBAL_VARIABLE].includes(
        type
      )
  );

  const { showModal: showAddStake } = useAddStakeModal({
    task,
    metadata,
    isPrivate,
    kplToken,
  });
  const { showModal: showUnstake } = useUnstakeModal({
    task,
  });
  const invalidateTaskList = () =>
    queryCache.invalidateQueries([QueryKeys.TaskList]);
  const showUnstakeModal = () => {
    showUnstake().then(invalidateTaskList);
  };

  const roundNumber = useTaskRoundNumber(task);

  const { lastSubmissionFormatted } = useTaskLastSubmission(
    correspondingStakingKey,
    task.publicKey,
    task.roundTime
  );

  const newTaskVariableSet = new Set(
    newTaskVersionVariables?.map((v) => v.name)
  );
  const oldTaskVariableSet = new Set(
    oldTaskVersionVariables?.map((v) => v.value)
  );

  const upgradeUsesDifferentVariables = !!(
    newTaskVersionVariables?.some((v) => !oldTaskVariableSet.has(v.name)) ||
    oldTaskVersionVariables?.some(
      (v) => !newTaskVariableSet.has(v?.value || '')
    )
  );

  const { taskThumbnail } = useTaskThumbnail({
    thumbnailUrl: metadata?.imageUrl,
  });

  useEffect(() => {
    const validateAllVariablesWerePaired = () => {
      const numberOfPairedVariables = Object.keys(
        newTaskVersionPairedVariables || {}
      ).length;

      const allVariablesWerePaired =
        (newTaskVersionVariables?.length || 0) === numberOfPairedVariables;

      setIsTaskSettingsValid(allVariablesWerePaired);
    };

    validateAllVariablesWerePaired();
  }, [newTaskVersionPairedVariables, newTaskVersionVariables, taskName]);

  const { topStake, totalBounty, totalNodes, totalStake, lastReward } =
    useTaskStatsData(publicKey);

  const details: TaskStatsDataType = {
    nodesNumber: totalNodes,
    minStake: getKoiiFromRoe(task.minimumStakeAmount),
    myStake: myStakeInKoii,
    topStake: getKoiiFromRoe(topStake),
    bounty: getKoiiFromRoe(totalBounty),
    totalStakeInKoii: getKoiiFromRoe(totalStake),
    roundTime: task.roundTime,
  };

  const allTimeRewards = claimedRewards + pendingRewards;
  const allTimeRewardsInKoii = getKoiiFromRoe(allTimeRewards);
  const pendingRewardsInKoii = getKoiiFromRoe(pendingRewards);
  const isFirstRowInTable = index === 0;

  const { data: pairedVariables = [], isLoading: isLoadingPairedVariables } =
    useQuery([QueryKeys.StoredTaskPairedTaskVariables, task.publicKey], () =>
      getTaskPairedVariablesNamesWithLabels(task.publicKey)
    );

  const { showModal: showConfirmRunTaskModal } = useConfirmRunTask({
    taskName: task.taskName,
    pairedVariables: pairedVariables.reduce((acc, { name, variableId }) => {
      acc[name] = variableId;
      return acc;
    }, {} as Record<string, string>),
    stake: taskStake || 0,
    onConfirm: async () => {
      setLoading(true);
      await startTask(publicKey, isPrivate);
      await queryCache.invalidateQueries([QueryKeys.TaskList]);
      await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
      queryCache.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === QueryKeys.TasksPairedWithVariable,
      });
      setLoading(false);
    },
    ticker: kplToken?.symbol,
    decimals: kplToken?.decimals,
    isPrivate,
    taskId: publicKey,
  });

  const handleToggleTask = async () => {
    try {
      setLoading(true);
      if (isRunning) {
        await stopTask(publicKey);
        await queryCache.invalidateQueries([QueryKeys.TaskList]);
        await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
        queryCache.removeQueries({
          predicate: (query) =>
            query.queryKey[0] === QueryKeys.TasksPairedWithVariable,
        });
      } else {
        showConfirmRunTaskModal();
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  const [isRestartingTask, setIsRestartingTask] = useState(false);

  const handleRestartTask = async () => {
    try {
      setIsRestartingTask(true);
      await stopTask(publicKey);
      await queryCache.invalidateQueries([QueryKeys.TaskList]);
      await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
      await startTask(publicKey, isPrivate);
      await queryCache.invalidateQueries([QueryKeys.TaskList]);
      await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
    } catch (error) {
      console.warn(error);
    } finally {
      setIsRestartingTask(false);
    }
  };

  const handleOpenAddTaskVariableModal = async (
    dropdownRef: RefObject<HTMLButtonElement>,
    settingName: string
  ) => {
    setIsAddTaskSettingModalOpen((isOpen) => !isOpen);
    const wasSettingAdded = await showAddTaskSettingModal(settingName);
    setIsAddTaskSettingModalOpen(false);
    // focus on dropdown after creating new setting
    if (wasSettingAdded) {
      setTimeout(() => {
        dropdownRef?.current?.click();
      }, 100);
    }
  };

  const handleTaskToolsValidationCheck = (isValid: boolean) => {
    setIsTaskSettingsValid(isValid);
  };

  const [parent] = useAutoAnimate();

  const infoRef = useRef<HTMLDivElement>(null);
  const optionsDropdownRef = useRef<HTMLDivElement>(null);

  const optionsDropdownIsInverted =
    getBestTooltipPosition(optionsDropdownRef.current, tableRef.current) ===
    'top';

  const closeAccordionView = () => {
    if (!isAddTaskSettingModalOpen) {
      setAccordionView(null);
    }
  };
  const closeOptionsDropdown = () => setShouldDisplayActions(false);
  const openTaskLogs = async () => {
    const openedTheLogs: boolean = await openLogfileFolder(task.publicKey);
    if (!openedTheLogs) {
      toast.error('Unable to open the logs folder. Try Again');
    }
  };

  useOnClickOutside(
    infoRef as MutableRefObject<HTMLDivElement>,
    closeAccordionView,
    DROPDOWN_MENU_ID
  );
  useOnClickOutside(
    optionsDropdownRef as MutableRefObject<HTMLDivElement>,
    () => {
      /**
       * @dev do not close the dropdown if the user is archiving the task, so we wont lose archiving state
       */
      if (isArchivingTask) return;
      closeOptionsDropdown();
    },
    DROPDOWN_MENU_ID
  );

  const minStake = getKoiiFromRoe(task.minimumStakeAmount);

  const isTaskDelisted = !task.isActive;
  const isTaskNotRunning = !isRunning;
  const hasNoStake = !myStakeInKoii || myStakeInKoii === 0;
  const isDelistedPublicTask = isTaskDelisted && !isPrivate;
  const isAccordionOpen = accordionView !== null;
  const isLoadingAccordionInfo =
    isAccordionOpen &&
    {
      info: isLoadingMetadataFlag || isLoadingPairedVariables,
      'upgrade-info':
        isLoadingNewTaskVersion ||
        isLoadingPairedVariables ||
        isLoadingNewTaskVersionPairedVariables,
      'upgrade-settings':
        isLoadingNewTaskVersion || isLoadingNewTaskVersionPairedVariables,
    }[accordionView];

  const mainTooltipContent =
    upgradeStatus === UpgradeStatus.ACKNOWLEDGED
      ? 'This task has been updated. Upgrade now to run it.'
      : 'This task is inactive because the bounty is empty. The creator needs to refill the bounty before you can run it again.';

  const isBonusTask =
    taskName === BONUS_TASK_NAME && task.taskManager === BONUS_TASK_DEPLOYER;

  const containerClasses = `py-2 gap-y-0 min-h-[78.31px] md2:min-h-[88.55px] w-full cursor-pointer group/row ${
    isBonusTask
      ? isBountyEmpty
        ? 'bg-[linear-gradient(45deg,rgba(128,128,128,0.01)_0%,rgba(96,96,96,0.5)_20%,rgba(96,96,96,0.5)_80%,rgba(128,128,128,0.01)_100%)]'
        : 'bg-[linear-gradient(45deg,rgba(251,191,36,0.01)_0%,rgba(201,150,20,0.5)_20%,rgba(201,150,20,0.5)_80%,rgba(251,191,36,0.01)_100%)]'
      : [
          UpgradeStatus.UPGRADE_AVAILABLE,
          UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE,
          UpgradeStatus.IS_CONFIRMING_UPGRADE,
          UpgradeStatus.IN_PROGRESS,
        ].includes(upgradeStatus)
      ? 'bg-finnieTeal/[0.05] animate-white-glimmer'
      : upgradeStatus === UpgradeStatus.ACKNOWLEDGED
      ? 'bg-[#FFA54B]/[0.05]'
      : upgradeStatus === UpgradeStatus.ERROR
      ? 'bg-finnieRed-500/[0.05]'
      : upgradeStatus === UpgradeStatus.SUCCESS
      ? 'bg-finnieEmerald-light/[0.05]'
      : taskStatus === TaskStatus.FLAGGED
      ? 'bg-finnieRed-500/[0.05]'
      : [TaskStatus.ERROR, TaskStatus.BLACKLISTED].includes(taskStatus) ||
        isBountyEmpty
      ? 'bg-finnieRed-500/[0.05]'
      : !isRunning
      ? 'bg-[#FFA54B]/[0.05]'
      : ''
  }`;

  const updateIconClasses = `stroke-[1.4px] ${
    [
      UpgradeStatus.ACKNOWLEDGED,
      UpgradeStatus.NEW_VERSION_BEING_AUDITED,
      UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE,
    ].includes(upgradeStatus)
      ? 'text-finnieOrange'
      : 'text-finnieTeal'
  } ${
    [
      UpgradeStatus.UPGRADE_AVAILABLE,
      UpgradeStatus.ACKNOWLEDGED,
      UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE,
    ].includes(upgradeStatus) && 'cursor-pointer'
  }`;

  const optionsButtonClasses = `py-0.75 !pr-[0.5px] rounded-full transition-all duration-300 ease-in-out hover:bg-purple-5/50 ${
    shouldDisplayActions ? 'bg-purple-5 hover:bg-purple-5' : 'bg-transparent'
  } h-12 w-12`;

  const accordionClasses = `w-full col-span-10 overflow-y-auto inner-scrollbar ${
    accordionView !== null
      ? // 9000px is just a simbolic value of a ridiculously high height, the animation needs absolute max-h values to work properly (fit/max/etc won't work)
        'opacity-1 pb-3 pt-5 max-h-[9000px]'
      : 'opacity-0 max-h-0'
  } transition-all duration-500 ease-in-out`;

  const handleHideMainTooltip = () => {
    setHideTooltip(true);
  };

  const handleShowMainTooltip = () => {
    setHideTooltip(false);
  };

  const handleTaskArchive = async (isArchiving: boolean) => {
    setIsArchivingTask(isArchiving);
  };

  const handleToggleInfoAccordion: MouseEventHandler = (event) => {
    const target = event.target as HTMLElement;
    const statusBarTrigger = target.closest(
      '[data-accordion-trigger="status-bar"]'
    );

    const isUpgradeViewTrigger = target.id === 'upgrade-view';
    const shouldIgnoreClick =
      event.target !== event.currentTarget &&
      !statusBarTrigger &&
      !isUpgradeViewTrigger;

    if (shouldIgnoreClick) {
      return;
    }

    event.stopPropagation();
    setAccordionView((currentAccordionView) =>
      currentAccordionView === 'info' ? null : 'info'
    );
  };

  const handleToggleInfoAccordionOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setAccordionView((currentAccordionView) =>
        currentAccordionView === 'info' ? null : 'info'
      );
    }
  };

  const handleToggleSettingsAccordion = () => {
    setAccordionView((currentAccordionView) =>
      currentAccordionView === 'upgrade-settings' ? null : 'upgrade-settings'
    );
  };

  const handleToggleUpgradeInfoAccordion = () => {
    setAccordionView((currentAccordionView) =>
      currentAccordionView === 'upgrade-info' ? null : 'upgrade-info'
    );
  };

  const handleAcknowledgeUpgrade = () => {
    setUpgradeStatus(UpgradeStatus.ACKNOWLEDGED);
  };

  const handleMoveToConfirmUpgrade = () => {
    setUpgradeStatus(UpgradeStatus.IS_CONFIRMING_UPGRADE);
  };

  const handleMoveToPrivateUpgradeWarning = () => {
    setUpgradeStatus(UpgradeStatus.PRIVATE_UPGRADE_WARNING);
  };

  const handleDisplayPrivateUpgradeAvailable = () => {
    setUpgradeStatus(UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE);
  };

  const handleDisplayUpgradeAvailable = () => {
    setUpgradeStatus(UpgradeStatus.UPGRADE_AVAILABLE);
  };

  const handleToggleOptionsDropdown = () => {
    setShouldDisplayActions((shouldDisplayActions) => !shouldDisplayActions);
  };

  const handleClickArrow =
    upgradeStatus === UpgradeStatus.IS_CONFIRMING_UPGRADE &&
    newTaskVersion?.isWhitelisted
      ? handleDisplayUpgradeAvailable
      : handleDisplayPrivateUpgradeAvailable;

  const handleClickOnUpdateIcon =
    UpgradeStatus.ACKNOWLEDGED === upgradeStatus
      ? newTaskVersion?.isWhitelisted
        ? handleDisplayUpgradeAvailable
        : handleDisplayPrivateUpgradeAvailable
      : UpgradeStatus.UPGRADE_AVAILABLE === upgradeStatus
      ? handleMoveToConfirmUpgrade
      : UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE === upgradeStatus
      ? handleMoveToPrivateUpgradeWarning
      : noop;

  const hasOngoingRetry = useMemo(() => {
    const timerReference = get(taskRetryData, 'timerReference');
    const cancelled = get(taskRetryData, 'cancelled');
    if (timerReference && !cancelled) return true;
    return false;
  }, [taskRetryData]);

  const taskRetryRemainingTime = useMemo(() => {
    const timestamp = get(taskRetryData, 'timestamp');
    const count = get(taskRetryData, 'count');

    if (timestamp && count) {
      const timeHasPassed = Date.now() - timestamp;
      const retryInterval = 2 ** (count + 1) * 1000;
      const totalTime = Math.min(retryInterval, MAX_TASK_RETRY_TIME);
      if (totalTime > timeHasPassed) return totalTime - timeHasPassed;
    }

    return 0;
  }, [taskRetryData]);

  const handleCancelTaskRetry = async () => {
    await cancelTaskRetry(task.publicKey);
    queryCache.invalidateQueries();
  };

  const { Counter, timeRemaining } = useCountDown({
    durationInSeconds: Math.floor(taskRetryRemainingTime / 1000),
  });

  const taskVariablesRequired = metadata?.requirementsTags.filter(
    (requirement) => requirement.type === 'TASK_VARIABLE'
  );

  const allTaskVariablesWithPairings = useMemo(
    () =>
      taskVariablesRequired?.map((requiredVariable) => {
        const pairedVariable = pairedVariables.find(
          (paired) => paired.name === requiredVariable.value
        );

        return {
          name: requiredVariable?.value,
          label: pairedVariable?.label,
          variableId: pairedVariable?.variableId || '',
        };
      }) || [],
    [taskVariablesRequired, pairedVariables]
  );

  const hasAllVariablesPaired =
    isLoadingPairedVariables ||
    isLoadingMetadata ||
    allTaskVariablesWithPairings.filter((pairing) => !!pairing.variableId)
      .length ===
      metadata?.requirementsTags.filter((tag) => tag.type === 'TASK_VARIABLE')
        .length;

  const pairedAndUnpairedNewTaskVersionVariables = uniqBy(
    [
      ...newTaskVersionPairedVariablesWithLabel,
      ...(upgradeUsesDifferentVariables ? [] : allTaskVariablesWithPairings),
      ...newTaskVersionVariables,
    ],
    'name'
  );

  const stopTaskIfDelisted = useCallback(async () => {
    if (
      isRunning &&
      (!task.isActive ||
        isBountyEmpty ||
        task.isMigrated ||
        !hasAllVariablesPaired)
    ) {
      try {
        await stopTask(publicKey);
        await queryCache.invalidateQueries([QueryKeys.TaskList]);
        await queryCache.invalidateQueries([QueryKeys.RunningTasksPubKeys]);
        queryCache.removeQueries({
          predicate: (query) =>
            query.queryKey[0] === QueryKeys.TasksPairedWithVariable,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [
    isRunning,
    task.isActive,
    publicKey,
    isBountyEmpty,
    queryCache,
    task.isMigrated,
    hasAllVariablesPaired,
  ]);

  useEffect(() => {
    stopTaskIfDelisted();
  }, [stopTaskIfDelisted]);

  const isPlayPauseButtonDisabled =
    isTaskNotRunning &&
    (hasNoStake ||
      isDelistedPublicTask ||
      isBountyEmpty ||
      !hasAllVariablesPaired);
  const toggleTaskTooltipContent = getTooltipContent({
    isRunning,
    isBountyEmpty,
    isTaskDelisted,
    myStakeInKoii,
    minStake,
    isPrivate,
    hasAllVariablesPaired,
    isBonusTask,
    redirectToPairMissingExtensions: async () => {
      setAccordionView('info');
      // Wait for next render cycle and animation to complete
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced initial wait time

      // Keep trying to find the element for a short period
      let attempts = 0;
      const maxAttempts = 10;
      const findElement = async () => {
        const taskSettingsElement = document.getElementById(
          `task-settings-${publicKey}`
        );

        if (taskSettingsElement) {
          taskSettingsElement.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < maxAttempts) {
          // eslint-disable-next-line no-plusplus
          attempts++;
          // eslint-disable-next-line no-promise-executor-return
          await new Promise((resolve) => setTimeout(resolve, 100));
          await findElement();
        }
      };

      await findElement();
    },
  });
  const toggleTaskButtonClasses = `group-hover/play:text-finnieTeal-100 group-hover/play:scale-110 transition-all duration-300 ease-in-out ${
    isRunning && myStakeInKoii && myStakeInKoii > 0
      ? 'text-finniePurple'
      : 'text-white'
  }
${isPlayPauseButtonDisabled && 'opacity-60'}`;
  const infoButtonTooltipContent = `${
    accordionView === 'info' ? 'Close task details' : 'Open task details'
  }`;

  const propsManagingMainTooltipState = {
    onFocus: handleHideMainTooltip,
    onMouseOver: handleHideMainTooltip,
    onBlur: handleShowMainTooltip,
    onMouseLeave: handleShowMainTooltip,
  };
  const taskInfoProps = {
    publicKey:
      accordionView === 'upgrade-info'
        ? newTaskVersion?.publicKey || ''
        : task.publicKey,
    creator: task.taskManager,
    variables:
      accordionView === 'upgrade-info'
        ? (pairedAndUnpairedNewTaskVersionVariables as TaskPairing[])
        : (allTaskVariablesWithPairings as any),

    metadataCID:
      accordionView === 'upgrade-info'
        ? newTaskVersion?.metadataCID || ''
        : task.metadataCID,
    metadata:
      accordionView === 'upgrade-info'
        ? newTaskVersionMetadata || undefined
        : metadata || undefined,
    details: accordionView === 'upgrade-info' ? newTaskVersionDetails : details,
    isRunning,
    isUpgradeInfo: accordionView === 'upgrade-info',
    onOpenAddTaskVariableModal: handleOpenAddTaskVariableModal,
    shouldDisplayToolsInUse: true,
    pendingRewards: accordionView === 'info' ? pendingRewards : undefined,
    shouldDisplayArchiveButton:
      accordionView === 'info' && !isRunning && !myStakeInKoii,
    tokenTicker: kplToken?.symbol || 'KOII',
  };

  const retryAnimationClasses = `w-[25px] h-[25px]
    ${timeRemaining <= 0 && 'animate-spin'}`;
  const tooltipRightPlacement: Placement = `${
    isFirstRowInTable ? 'bottom' : 'top'
  }-right`;

  const isInUpgrade = useMemo(
    () =>
      [
        UpgradeStatus.UPGRADE_AVAILABLE,
        UpgradeStatus.ACKNOWLEDGED,
        UpgradeStatus.IN_PROGRESS,
        UpgradeStatus.NEW_VERSION_BEING_AUDITED,
        UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE,
      ].includes(upgradeStatus),
    [upgradeStatus]
  );

  const tags = [
    ...(metadata?.tags || []),
    ...(isOrcaTask(metadata) ? ['ORCA_TASK'] : []),
  ];

  const isKplMiner = !isPrivate && taskName === 'KPL token Miner';

  if (upgradeStatus === UpgradeStatus.IN_PROGRESS)
    return (
      <TableRow
        columnsLayout={columnsLayout}
        className={containerClasses}
        ref={infoRef}
        onClick={handleToggleInfoAccordion}
      >
        <UpgradeInProgressContent />
      </TableRow>
    );

  if (upgradeStatus === UpgradeStatus.SUCCESS)
    return (
      <TableRow
        columnsLayout={columnsLayout}
        className={containerClasses}
        ref={infoRef}
        onClick={handleToggleInfoAccordion}
      >
        <UpgradeSucceededContent
          newTaskVersionName={newTaskVersion?.taskName || ''}
        />
      </TableRow>
    );

  if (upgradeStatus === UpgradeStatus.ERROR)
    return (
      <TableRow
        columnsLayout={columnsLayout}
        className={containerClasses}
        ref={infoRef}
        onClick={handleToggleInfoAccordion}
      >
        <UpgradeFailedContent
          retryUpgrade={() => setUpgradeStatus(UpgradeStatus.UPGRADE_AVAILABLE)}
        />
      </TableRow>
    );

  return (
    <TableRow
      columnsLayout={columnsLayout}
      className={containerClasses}
      ref={infoRef}
      onClick={handleToggleInfoAccordion}
    >
      {upgradeStatus === UpgradeStatus.PRIVATE_UPGRADE_WARNING ? (
        <PrivateUpgradeWarning
          onReview={handleToggleUpgradeInfoAccordion}
          onAcknowledge={handleAcknowledgeUpgrade}
          onUpgrade={handleMoveToConfirmUpgrade}
          isFirstRowInTable={isFirstRowInTable}
          isCoolingDown={isCoolingDown}
        />
      ) : (
        <>
          <Thumbnail
            taskName={taskName}
            tooltipContent={infoButtonTooltipContent}
            onKeyDown={handleToggleInfoAccordionOnKeyDown}
            onClick={handleToggleInfoAccordion}
            src={taskThumbnail}
            isBonusTask={isBonusTask}
            isBountyEmpty={isBountyEmpty}
          />
          {upgradeStatus === UpgradeStatus.NEW_VERSION_BEING_AUDITED ? (
            <>
              <NewVersionInAudit />
              <Options
                showAddStakeModal={showAddStake}
                showUnstakeModal={showUnstakeModal}
                canUnstake={canUnstake}
                openTaskLogs={openTaskLogs}
                handleToggleTask={handleToggleTask}
                task={task}
                optionsDropdownIsInverted={optionsDropdownIsInverted}
                handleTaskArchive={handleTaskArchive}
                optionsButtonClasses={optionsButtonClasses}
                handleToggleOptionsDropdown={handleToggleOptionsDropdown}
                ref={optionsDropdownRef}
                shouldDisplayActions={shouldDisplayActions}
                handleRestartTask={handleRestartTask}
                isRestartingTask={isRestartingTask}
              />
            </>
          ) : upgradeStatus === UpgradeStatus.UPGRADE_AVAILABLE ||
            upgradeStatus === UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE ? (
            <>
              <Tags isLoadingTags={isLoadingMetadata} tags={tags} isPrivate />
              <ConfirmUpgradeContent
                oldVersionStake={taskStake || 0}
                onReview={handleToggleUpgradeInfoAccordion}
                hasVariablesToUpgrade={upgradeUsesDifferentVariables}
                taskVariables={newTaskVersionVariables}
                openSettings={handleToggleSettingsAccordion}
                taskPublicKey={publicKey}
                newtaskVersion={newTaskVersion}
                onUpgrade={upgradeTask}
                newStake={0}
                minStake={newTaskVersion?.minimumStakeAmount || 0}
                isLoadingNewVersion={isLoadingNewTaskVersion}
                isTaskSettingsValid={isTaskSettingsValid}
                isFirstRowInTable={isFirstRowInTable}
                tokenType={task.tokenType}
                onAcknowledge={handleAcknowledgeUpgrade}
                onBackgroundClick={handleToggleInfoAccordion}
              />
            </>
          ) : upgradeStatus === UpgradeStatus.IS_CONFIRMING_UPGRADE ? (
            <>
              <Tags
                isLoadingTags={isLoadingMetadata}
                tags={tags}
                isPrivate={isPrivate}
              />
              <ConfirmUpgradeContent
                oldVersionStake={taskStake || 0}
                onReview={handleToggleUpgradeInfoAccordion}
                hasVariablesToUpgrade={upgradeUsesDifferentVariables}
                taskVariables={newTaskVersionVariables}
                openSettings={handleToggleSettingsAccordion}
                taskPublicKey={publicKey}
                newtaskVersion={newTaskVersion}
                onUpgrade={upgradeTask}
                newStake={0}
                minStake={newTaskVersion?.minimumStakeAmount || 0}
                isLoadingNewVersion={isLoadingNewTaskVersion}
                isTaskSettingsValid={isTaskSettingsValid}
                isFirstRowInTable={isFirstRowInTable}
                tokenType={task.tokenType}
                onAcknowledge={handleAcknowledgeUpgrade}
                onBackgroundClick={handleToggleInfoAccordion}
              />
            </>
          ) : (
            <>
              <Tags
                isLoadingTags={isLoadingMetadata}
                tags={tags}
                isPrivate={isPrivate}
              />
              <StatusBar
                status={taskStatus}
                isLoading={isLoadingStatus}
                isRunning={isRunning}
                taskId={task.publicKey}
                nextReward={lastReward}
                roundTime={task.roundTime}
                startingSlot={task.startingSlot}
                tokenSymbol={kplToken?.symbol || 'KOII'}
                pendingRewards={pendingRewardsInKoii}
                taskName={taskName}
                isPrivate={isPrivate}
                isBonusTask={isBonusTask}
                isBountyEmpty={isBountyEmpty}
              />

              <RewardsCell
                nextReward={
                  isBonusTask || isKplMiner ? (
                    <SurpriseBoxes className="h-fit w-10 m-auto my-0.5" />
                  ) : lastReward ? (
                    <CurrencyDisplay
                      amount={lastReward}
                      currency={kplToken?.symbol || 'KOII'}
                      precision={2}
                    />
                  ) : (
                    'N/A'
                  )
                }
                pendingRewards={
                  <CurrencyDisplay
                    currency={kplToken?.symbol || 'KOII'}
                    amount={pendingRewardsInKoii}
                    precision={
                      pendingRewardsInKoii > 10 || pendingRewardsInKoii === 0
                        ? 0
                        : 3
                    }
                    hideSymbol
                  />
                }
                allTimeRewards={
                  <CurrencyDisplay
                    currency={kplToken?.symbol || 'KOII'}
                    amount={allTimeRewardsInKoii}
                    precision={
                      allTimeRewardsInKoii > 10 || allTimeRewardsInKoii === 0
                        ? 0
                        : 2
                    }
                    hideSymbol
                  />
                }
              />
              <Token token={kplToken} isLoading={isLoadingKplToken} />

              <Options
                showAddStakeModal={showAddStake}
                showUnstakeModal={showUnstakeModal}
                openTaskLogs={openTaskLogs}
                handleToggleTask={handleToggleTask}
                canUnstake={canUnstake}
                task={task}
                optionsDropdownIsInverted={optionsDropdownIsInverted}
                handleTaskArchive={handleTaskArchive}
                optionsButtonClasses={optionsButtonClasses}
                handleToggleOptionsDropdown={handleToggleOptionsDropdown}
                ref={optionsDropdownRef}
                shouldDisplayActions={shouldDisplayActions}
                handleRestartTask={handleRestartTask}
                isRestartingTask={isRestartingTask}
              />

              <div {...propsManagingMainTooltipState}>
                {loading ? (
                  <div>
                    <LoadingSpinner size={LoadingSpinnerSize.Large} />
                  </div>
                ) : isInUpgrade ? (
                  <Popover
                    tooltipContent={
                      [UpgradeStatus.IN_PROGRESS].includes(upgradeStatus)
                        ? 'Upgrade in progress'
                        : [UpgradeStatus.PRIVATE_UPGRADE_AVAILABLE].includes(
                            upgradeStatus
                          )
                        ? 'Running tasks that are not vetted by our team could be risky.'
                        : 'Upgrade available'
                    }
                  >
                    <UpdateIcon
                      className={updateIconClasses}
                      onClick={handleClickOnUpdateIcon}
                    />
                  </Popover>
                ) : [
                    UpgradeStatus.IS_CONFIRMING_UPGRADE,
                    UpgradeStatus.PRIVATE_UPGRADE_WARNING,
                  ].includes(upgradeStatus) ? (
                  <button
                    onClick={handleClickArrow}
                    className="flex items-center justify-center w-12 h-12 cursor-pointer"
                  >
                    <ArrowIcon className="cursor-pointer" />
                  </button>
                ) : hasOngoingRetry ? (
                  <Popover tooltipContent="Click to retry now">
                    <button
                      className="flex flex-col items-center justify-center cursor-pointer"
                      onClick={handleToggleTask}
                    >
                      <RetryAnim className={retryAnimationClasses} />
                      {Counter}
                    </button>
                  </Popover>
                ) : (
                  <Popover
                    theme={Theme.Dark}
                    tooltipContent={toggleTaskTooltipContent}
                  >
                    <Button
                      onlyIcon
                      icon={
                        <Icon
                          source={isRunning ? PauseFill : PlayFill}
                          size={20}
                          className={toggleTaskButtonClasses}
                        />
                      }
                      onClick={handleToggleTask}
                      className="w-8 h-8 rounded-full group/play"
                      disabled={isPlayPauseButtonDisabled}
                    />
                  </Popover>
                )}
              </div>
            </>
          )}
        </>
      )}

      <div className={accordionClasses}>
        <div ref={parent} className="flex w-full">
          {isAccordionOpen &&
            (isLoadingAccordionInfo ? (
              <div className="m-auto">
                <LoadingSpinner />
              </div>
            ) : accordionView === 'upgrade-settings' ? (
              <TaskSettings
                taskPubKey={newTaskVersion?.publicKey || ''}
                onToolsValidation={handleTaskToolsValidationCheck}
                taskVariables={newTaskVersionVariables}
                onPairingSuccess={closeAccordionView}
                onOpenAddTaskVariableModal={handleOpenAddTaskVariableModal}
                moveToTaskInfo={() => setAccordionView('upgrade-info')}
              />
            ) : (
              <TaskInfo {...taskInfoProps} />
            ))}
        </div>
      </div>
    </TableRow>
  );
}
