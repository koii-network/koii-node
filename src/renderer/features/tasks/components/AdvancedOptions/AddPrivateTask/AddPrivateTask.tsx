import { useAutoAnimate } from '@formkit/auto-animate/react';
import React, {
  MutableRefObject,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { CRITICAL_MAIN_ACCOUNT_BALANCE } from 'config/node';
import { isNumber } from 'lodash';
import { KPLBalanceResponse, RequirementTag, RequirementType } from 'models';
import {
  ColumnsLayout,
  EditStakeInput,
  LoadingSpinner,
  LoadingSpinnerSize,
  TableRow,
} from 'renderer/components/ui';
import { DROPDOWN_MENU_ID } from 'renderer/components/ui/Dropdown/Dropdown';
import {
  useAccountBalance,
  useAddTaskVariableModal,
  useAllStoredPairedTaskVariables,
  useConfirmRunTask,
  useFundNewAccountModal,
  useMainAccount,
  useMetadata,
  useOnClickOutside,
  usePrivateTasks,
  useStartedTasksPubKeys,
  useStartingTasksContext,
  useUserAppConfig,
} from 'renderer/features';
import { useAutoPairVariables } from 'renderer/features/common/hooks/useAutoPairVariables';
import { useCreateMissingKPLStakingKey } from 'renderer/features/shared/hooks/useCreateMissingKPLStakingKey';
import { showTaskRunErrorToast } from 'renderer/features/tasks/components/AvailableTasksTable/utils';
import { useMyTaskStake } from 'renderer/features/tasks/hooks/useMyTaskStake';
import { isNetworkingTask } from 'renderer/features/tasks/utils';
import { useKplToken } from 'renderer/features/tokens/hooks/useKplToken';
import {
  getKPLStakingAccountPubKey,
  QueryKeys,
  stopTask,
} from 'renderer/services';
import { AppRoute } from 'renderer/types/routes';
import { isValidWalletAddress } from 'renderer/utils';
import { getKoiiFromRoe } from 'utils';

import { StartPauseTaskButton } from '../../AvailableTaskRow/components/StartPauseTaskButton/StartPauseTaskButton';
import { SuccessMessage } from '../../AvailableTasksTable/components/SuccessMessage';
import { PrivateTaskInput } from '../PrivateTaskInput';
import { useTaskById } from '../useTaskById';

import {
  DEFAULT_TASK_WARNING,
  TASK_ALREADY_STARTED_WARNING,
  TASK_ID_DOES_NOT_MATCH_WARNING,
} from './constants';
import { PrivateTaskWarning } from './PrivateTaskWarning';
import { SettingsAccordion } from './SettingsAccordion';
import { SettingsButton } from './SettingsButton';

interface Props {
  columnsLayout: ColumnsLayout;
  onClose: () => void;
}

export function AddPrivateTask({ columnsLayout, onClose }: Props) {
  const { isLoading: loadingStartedTasks, data: startedTasks } =
    useStartedTasksPubKeys();
  const queryCache = useQueryClient();
  const { executeTask, getTaskStartPromise, getIsTaskLoading } =
    useStartingTasksContext();
  const { addPrivateTask } = usePrivateTasks();
  const { showModal: showAddTaskVariableModal } = useAddTaskVariableModal();
  const [taskPubkey, setTaskPubkey] = useState<string>('');
  const [isValidPublicKey, setIsValidPublicKey] = useState<boolean>(false);

  const [isAddTaskSettingModalOpen, setIsAddTaskSettingModalOpen] =
    useState<boolean>(false);
  useState<boolean>(false);

  const [accordionView, setAccordionView] = useState<boolean>(false);
  const [isTaskToolsValid, setIsTaskToolsValid] = useState(false);
  const [isTaskValidToRun, setIsTaskValidToRun] = useState(false);
  const [taskStartSucceeded, setTaskStartSucceeded] = useState(false);
  const [valueToStake, setValueToStake] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | ReactNode>('');
  const [taskWarning, setTaskWarning] = useState<string>(DEFAULT_TASK_WARNING);
  const { data: mainAccountPubKey = '' } = useMainAccount();

  const { data: task, isLoading: loadingTask } = useTaskById({
    taskPubkey,
    options: {
      enabled:
        !!taskPubkey &&
        !!mainAccountPubKey &&
        isValidPublicKey &&
        !loadingStartedTasks,
      // never cache this query because we want to always get the latest task data
      onSettled: (data) => {
        if (!data) {
          setTaskWarning(TASK_ID_DOES_NOT_MATCH_WARNING);
        } else if (startedTasks?.includes(taskPubkey)) {
          setTaskWarning(TASK_ALREADY_STARTED_WARNING);
        } else {
          setTaskWarning(DEFAULT_TASK_WARNING);
        }
      },
      onSuccess: (data) => {
        if (data?.minimumStakeAmount) {
          setValueToStake(data.minimumStakeAmount);
        }
      },
    },
  });

  const { accountBalance = 0 } = useAccountBalance(mainAccountPubKey);

  const {
    storedPairedTaskVariablesQuery: { data: allPairedVariables = {} },
  } = useAllStoredPairedTaskVariables({
    enabled: !!taskPubkey,
  });

  const pairedVariables = Object.entries(allPairedVariables).filter(
    ([taskId]) => taskId === taskPubkey
  )[0]?.[1];

  const ref = useRef<HTMLDivElement>(null);

  const [parent] = useAutoAnimate();

  const closeAccordionView = useCallback(() => {
    if (isAddTaskSettingModalOpen) {
      return;
    }
    setAccordionView(false);
  }, [isAddTaskSettingModalOpen]);

  useOnClickOutside(
    ref as MutableRefObject<HTMLDivElement>,
    closeAccordionView,
    DROPDOWN_MENU_ID
  );

  const handleToggleView = useCallback(() => {
    setAccordionView((prevState) => !prevState);
  }, []);

  const handleTaskToolsValidationCheck = (isValid: boolean) => {
    setIsTaskToolsValid(isValid);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const isValid = await isValidWalletAddress(value);

    if (isValid) {
      setIsValidPublicKey(true);
    } else {
      setIsValidPublicKey(false);
      setTaskWarning(TASK_ID_DOES_NOT_MATCH_WARNING);
    }

    setTaskPubkey(value);
  };

  const { kplToken } = useKplToken({ tokenType: task?.tokenType || '' });
  const minStake = task?.minimumStakeAmount;
  const minStakeToDisplay =
    task?.taskType === 'KPL'
      ? (task?.minimumStakeAmount || 0) / 10 ** (kplToken?.decimals || 9) || 0
      : getKoiiFromRoe(task?.minimumStakeAmount || 0);
  const { metadata, isLoadingMetadata } = useMetadata({
    metadataCID: task?.metadataCID ?? null,
    taskPublicKey: taskPubkey,
    queryOptions: {
      enabled: !!task?.metadataCID,
    },
  });

  const globalAndTaskVariables: RequirementTag[] = useMemo(
    () =>
      metadata?.requirementsTags?.filter(({ type }) =>
        [
          RequirementType.TASK_VARIABLE,
          RequirementType.GLOBAL_VARIABLE,
        ].includes(type)
      ) || [],
    [metadata?.requirementsTags]
  );

  const {
    data: alreadyStakedTokensAmount,
    isLoading: loadingCurrentTaskStake,
  } = useMyTaskStake(task?.publicKey || '', task?.taskType, false);

  useEffect(() => {
    getTaskStartPromise(taskPubkey)
      ?.then(() => {
        setTaskStartSucceeded(true);
      })
      .catch(() => {
        setTaskStartSucceeded(false);
        showTaskRunErrorToast(task?.taskName);
      });
  }, [getTaskStartPromise, taskPubkey, task, task?.taskName]);

  useEffect(() => {
    const validateAllVariablesWerePaired = () => {
      const numberOfPairedVariables = Object.keys(pairedVariables || {}).length;

      const allVariablesWerePaired =
        (globalAndTaskVariables?.length || 0) === numberOfPairedVariables;
      setIsTaskToolsValid(allVariablesWerePaired);
    };

    validateAllVariablesWerePaired();
  }, [pairedVariables, globalAndTaskVariables]);

  const hasEnoughKoii =
    (alreadyStakedTokensAmount &&
      accountBalance >= CRITICAL_MAIN_ACCOUNT_BALANCE &&
      alreadyStakedTokensAmount >= Number(minStake)) ||
    accountBalance >= valueToStake + CRITICAL_MAIN_ACCOUNT_BALANCE;
  const meetsMinimumStake =
    (alreadyStakedTokensAmount || valueToStake) >= Number(minStake);

  const handleStopTask = async () => {
    try {
      await stopTask(taskPubkey);
    } catch (error) {
      console.error(error);
    } finally {
      queryCache.invalidateQueries();
    }
  };

  const handleStakeValueChange = (value: number) => {
    setValueToStake(value);
  };

  const handleOpenAddTaskVariableModal = useCallback(
    (dropdownRef: RefObject<HTMLButtonElement>, tool: string) => {
      setIsAddTaskSettingModalOpen((prev) => !prev);
      showAddTaskVariableModal(tool).then((wasVariableAdded) => {
        setIsAddTaskSettingModalOpen(false);
        // focus dropdown after creating new variable
        if (wasVariableAdded) {
          setTimeout(() => {
            dropdownRef?.current?.click();
          }, 100);
        }
      });
    },
    [showAddTaskVariableModal]
  );

  const { userConfig: settings } = useUserAppConfig();

  const isUsingNetworking = useMemo(
    () => isNetworkingTask(metadata),
    [metadata]
  );
  const userHasNetworkingEnabled = useMemo(
    () => !!settings?.networkingFeaturesEnabled,
    [settings]
  );

  const handleStartTask = async () => {
    if (task) {
      try {
        await addPrivateTask(taskPubkey);
        await executeTask({
          publicKey: taskPubkey,
          valueToStake,
          isPrivate: task.isWhitelisted,
          alreadyStakedTokensAmount,
          isUsingNetworking,
          stakePotAccount: task.stakePotAccount,
          taskType: task.taskType,
          mintAddress: task.tokenType,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isEditStakeInputDisabled = useMemo(
    () => alreadyStakedTokensAmount !== 0 || loadingCurrentTaskStake || !task,
    [alreadyStakedTokensAmount, loadingCurrentTaskStake, task]
  );

  const taskAlreadyAdded = useMemo(
    () => startedTasks?.includes(taskPubkey),
    [startedTasks, taskPubkey]
  );

  const { showModal: showConfirmRunTaskModal } = useConfirmRunTask({
    taskName: task?.taskName || '',
    pairedVariables,
    stake: alreadyStakedTokensAmount || valueToStake,
    onConfirm: handleStartTask,
    ticker: kplToken?.symbol,
    decimals: kplToken?.decimals,
    isPrivate: true,
    taskId: taskPubkey,
  });

  const { showModal: showCreateMissingKplStakingKeyModal } =
    useCreateMissingKPLStakingKey();

  const showCreateMissingKplStakingKeyModalMemo = useCallback(
    () =>
      showCreateMissingKplStakingKeyModal().then(() => {
        return showConfirmRunTaskModal();
      }),
    [showConfirmRunTaskModal]
  );

  const isActive = task?.isActive;
  const startPauseDisabled =
    !isActive ||
    !isTaskValidToRun ||
    taskAlreadyAdded ||
    isLoadingMetadata ||
    (isUsingNetworking && !userHasNetworkingEnabled);

  const runButtonTooltipContent = loadingTask
    ? "We're loading some data for this task, it'll be a few seconds"
    : isLoadingMetadata
    ? 'Loading task metadata'
    : loadingCurrentTaskStake
    ? "We're still verifying you have no previous stake on this task, it'll be a few seconds"
    : errorMessage || 'Start task';

  const { data: kplStakingKey, error: kplStakingKeyError } = useQuery(
    QueryKeys.KPLStakingAccount,
    getKPLStakingAccountPubKey,
    {
      retry: false,
    }
  );
  const isMissingKplStakingKey =
    task?.taskType === 'KPL' && !kplStakingKey && !!kplStakingKeyError;

  const kplBalanceListQueryData: KPLBalanceResponse[] =
    queryCache.getQueryData([QueryKeys.KplBalanceList, mainAccountPubKey]) ||
    [];
  const kplBalance =
    kplBalanceListQueryData?.find((balance) => balance.mint === task?.tokenType)
      ?.balance || 0;
  const hasEnoughBalanceForStaking =
    alreadyStakedTokensAmount || task?.taskType === 'KOII'
      ? accountBalance >= valueToStake
      : kplBalance >= valueToStake;
  const hasEnoughKOII =
    task?.taskType === 'KPL' || alreadyStakedTokensAmount
      ? accountBalance >= CRITICAL_MAIN_ACCOUNT_BALANCE
      : accountBalance >= valueToStake + CRITICAL_MAIN_ACCOUNT_BALANCE;

  const tokenTicker = kplToken?.symbol || 'KOII';

  const navigate = useNavigate();

  const { showModal: showFundModal } = useFundNewAccountModal({});

  const validateTask = useCallback(() => {
    const getErrorMessage = () => {
      const conditions = [
        // {
        //   condition: !isMissingKplStakingKey,
        //   errorMessage:
        //     'have a KPL staking key set up in your currently active wallet',
        //   action: showCreateMissingKplStakingKeyModalMemo,
        // },
        {
          condition: hasEnoughBalanceForStaking,
          errorMessage: `have enough ${tokenTicker} to stake`,
          action: tokenTicker === 'KOII' ? showFundModal : undefined,
        },
        {
          condition: hasEnoughKOII,
          errorMessage: 'have enough KOII for fees',
          action: showFundModal,
        },
        {
          condition: meetsMinimumStake && isNumber(minStake),
          errorMessage: `stake at least ${minStakeToDisplay} ${tokenTicker} on this Task`,
        },
        {
          condition: isTaskToolsValid,
          errorMessage: 'configure the Task extensions',
          action: () => handleToggleView(),
        },
        {
          condition:
            !isUsingNetworking ||
            (isUsingNetworking && userHasNetworkingEnabled),
          errorMessage: "enable Networking in your node's settings",
          action: () => navigate(AppRoute.SettingsNetworkAndUPNP),
        },
      ];

      const errors = conditions
        .filter(({ condition }) => !condition)
        .map(({ errorMessage, action }) => ({ errorMessage, action }));

      if (errors.length === 0) {
        return '';
      } else if (errors.length === 1) {
        return (
          <div>
            Make sure you{' '}
            {errors[0].action ? (
              <button
                onClick={errors[0].action}
                className="font-semibold text-finnieTeal-100 hover:underline"
              >
                {errors[0].errorMessage}.
              </button>
            ) : (
              <>{errors[0].errorMessage}.</>
            )}
          </div>
        );
      } else {
        const errorList = errors.map(({ errorMessage, action }) => (
          <li key={errorMessage}>
            •{' '}
            {action ? (
              <button
                onClick={action}
                className="font-semibold text-finnieTeal-100 hover:underline"
              >
                {errorMessage}
              </button>
            ) : (
              errorMessage
            )}
          </li>
        ));
        return (
          <div>
            Make sure you:
            <br />
            <ul> {errorList}</ul>
          </div>
        );
      }
    };

    const errorMessage = getErrorMessage();
    setErrorMessage(errorMessage);

    const isTaskValid = !errorMessage;
    setIsTaskValidToRun(isTaskValid);
  }, [
    hasEnoughBalanceForStaking,
    isTaskToolsValid,
    hasEnoughKOII,
    meetsMinimumStake,
    tokenTicker,
    showFundModal,
    minStakeToDisplay,
    isUsingNetworking,
    userHasNetworkingEnabled,
    handleToggleView,
    navigate,
    // isMissingKplStakingKey,
    // showCreateMissingKplStakingKeyModalMemo,
    minStake,
  ]);

  useEffect(() => {
    validateTask();
  }, [validateTask]);

  useAutoPairVariables({
    taskPublicKey: taskPubkey,
    taskVariables: globalAndTaskVariables,
  });

  return taskStartSucceeded ? (
    <SuccessMessage iconWrapperClass="pl-5" />
  ) : (
    <div className="border-t-2 border-white">
      <div className="pb-2 rounded-b-lg bg-[#8989C7]/10 hover:bg-[#8989C7]/[0.15] transition-all duration-300 ease-in-out">
        <PrivateTaskWarning taskWarning={taskWarning} />
        <TableRow
          columnsLayout={columnsLayout}
          className="border-b-0 gap-y-0 hover:before:bg-transparent hover:before:shadow-none"
          ref={ref}
        >
          <PrivateTaskInput
            onChange={handleInputChange}
            task={task}
            taskPubkey={taskPubkey}
            alreadyStarted={taskAlreadyAdded}
            loadingTask={loadingTask}
            onClose={onClose}
          />

          <div className="mt-4">
            <EditStakeInput
              meetsMinimumStake={meetsMinimumStake && hasEnoughKoii}
              stake={valueToStake}
              minStake={minStakeToDisplay}
              onChange={handleStakeValueChange}
              disabled={isEditStakeInputDisabled}
              tokenTicker={kplToken?.symbol || 'KOII'}
            />
          </div>

          <SettingsButton
            isTaskToolsValid={isTaskToolsValid}
            globalAndTaskVariables={globalAndTaskVariables}
            onToggleView={handleToggleView}
          />

          {getIsTaskLoading(taskPubkey) ? (
            <div className="py-[0.72rem]">
              <LoadingSpinner size={LoadingSpinnerSize.Large} />
            </div>
          ) : (
            <StartPauseTaskButton
              isRunning={!!task?.isRunning}
              onStartTask={
                isMissingKplStakingKey
                  ? showCreateMissingKplStakingKeyModalMemo
                  : showConfirmRunTaskModal
              }
              onStopTask={handleStopTask}
              tooltipContent={runButtonTooltipContent}
              isTaskValidToRun={isTaskValidToRun}
              disabled={startPauseDisabled || loadingCurrentTaskStake}
            />
          )}
          <SettingsAccordion
            metadata={metadata}
            ref={parent}
            taskPubkey={taskPubkey}
            isOpen={accordionView}
            globalAndTaskVariables={globalAndTaskVariables}
            onTaskToolsValidationCheck={handleTaskToolsValidationCheck}
            onCloseAccordionView={closeAccordionView}
            onOpenAddTaskVariableModal={handleOpenAddTaskVariableModal}
          />
        </TableRow>
      </div>
    </div>
  );
}
