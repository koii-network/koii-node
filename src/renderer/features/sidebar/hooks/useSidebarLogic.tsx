import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  NODE_INFO_REFETCH_INTERVAL,
  NODE_INFO_STALE_TIME,
} from 'config/refetchIntervals';
import { GetTaskNodeInfoResponse, TaskType } from 'models';
import {
  useFundNewAccountModal,
  useMyNodeContext,
  useUserAppConfig,
} from 'renderer/features';
import { useAppNotifications } from 'renderer/features/notifications/hooks';
import {
  QueryKeys,
  claimRewards,
  fetchMyTasks,
  getKPLStakingAccountPubKey,
  getRunningTasksPubKeys,
  getStakingAccountPublicKey,
  getTaskNodeInfo,
} from 'renderer/services';
import { Task } from 'renderer/types';
import { AppRoute } from 'renderer/types/routes';

import { RewardsState } from '../types';

import { usePreviousRewards } from './usePreviousRewards';

const SIDEBAR_AND_MY_NODE_REFETCH_ENABLE_TIMEOUT = 25000;
const CLAIM_REWARDS_RETRY_VALUE = 5;

export const useSidebraLogic = () => {
  const queryClient = useQueryClient();
  const { setFetchMyTasksEnabled } = useMyNodeContext();
  const { handleSaveUserAppConfig, refetchUserConfig } = useUserAppConfig({});
  const tasksWithClaimableRewardsRef = useRef<number>(0);

  const [enableNodeInfoRefetch, setEnableNodeInfoRefetch] = useState(true);

  const { showModal: showFundModal } = useFundNewAccountModal();
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppNotification: showFirstNodeRewardBanner } =
    useAppNotifications('FIRST_NODE_REWARD');
  const showFirstNodeRewardNotification = async () => {
    const { data } = await refetchUserConfig();

    if (data) {
      const { firstRewardNotificationDisplayed } = data;
      if (!firstRewardNotificationDisplayed) {
        showFirstNodeRewardBanner();
        handleSaveUserAppConfig({
          settings: {
            firstRewardNotificationDisplayed: true,
          },
        });
      }
    }
  };

  const { data: runningTasksPubKeys } = useQuery(
    [QueryKeys.RunningTasksPubKeys],
    getRunningTasksPubKeys
  );

  const { data: nodeInfoData, isLoading: isLoadingNodeInfoData } = useQuery(
    [QueryKeys.taskNodeInfo],
    getTaskNodeInfo,
    {
      enabled: enableNodeInfoRefetch,
      refetchInterval: NODE_INFO_REFETCH_INTERVAL,
      staleTime: NODE_INFO_STALE_TIME,
      onSettled: (nodeInfo) => {
        const hasRewards = Object.values(nodeInfo?.pendingRewards || {}).some(
          (reward) => reward > 0
        );

        if (hasRewards) {
          showFirstNodeRewardNotification();
        }
      },
    }
  );

  const { newRewardsAvailable } = usePreviousRewards(
    nodeInfoData?.pendingRewards
  );

  const navigateToMyNode = () => navigate(AppRoute.MyNode);
  const navigateToAvailableTasks = () => navigate(AppRoute.AddTask);

  const handleAddFundsClick = () => {
    showFundModal();
  };

  const isAddTaskView = useMemo(
    () => location.pathname === AppRoute.AddTask,
    [location.pathname]
  );

  const isRewardClaimable = useMemo(
    () =>
      Object.values(nodeInfoData?.pendingRewards || {}).some(
        (reward) => reward > 0
      ),
    [nodeInfoData?.pendingRewards]
  );

  const handleClickClaim = async () => {
    const getCorrespondingStakingKeyGetter = (taskType: TaskType) =>
      taskType === 'KPL'
        ? getKPLStakingAccountPubKey
        : getStakingAccountPublicKey;

    const getPendingRewardsByTask = async (task: Task) => {
      const getCorrespondingStakingKey = getCorrespondingStakingKeyGetter(
        task.taskType || 'KOII'
      );
      const correspondingStakingKey = await getCorrespondingStakingKey();

      return task.availableBalances[correspondingStakingKey];
    };

    const tasks = (await fetchMyTasks({ limit: Infinity, offset: 0 })).content;

    const tasksWithClaimableRewards = await Promise.all(
      tasks.map(async (task) => {
        const pendingRewards = await getPendingRewardsByTask(task);
        return pendingRewards > 0 ? task : null;
      })
    );

    const claimableTasks = tasksWithClaimableRewards.filter(
      (task) => task !== null
    );
    // We need to set a ref to later compare to the number of rewards that were actually claimed, because with each request's retry the
    // number of tasks with rewards to claim could change and we need to compare it with the initial number of them
    tasksWithClaimableRewardsRef.current = claimableTasks.length;
    claimPendingRewards();
  };

  const enableRefecthingSidebarInfo = () => {
    setTimeout(() => {
      setEnableNodeInfoRefetch?.(true);
    }, SIDEBAR_AND_MY_NODE_REFETCH_ENABLE_TIMEOUT);
  };

  const handleFailure = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  const handlePartialFailure = () => {
    enableRefecthingSidebarInfo();
    toast.error('Not all rewards were claimed successfully, please try again.');
  };

  const handleSuccess = async () => {
    setEnableNodeInfoRefetch?.(false);

    queryClient.setQueryData<
      (oldNodeData: GetTaskNodeInfoResponse) => GetTaskNodeInfoResponse
    >([QueryKeys.taskNodeInfo], (oldNodeData: GetTaskNodeInfoResponse) => ({
      ...oldNodeData,
      pendingRewards: { KOII: 0 },
    }));
    setFetchMyTasksEnabled(true);
    enableRefecthingSidebarInfo();
    await queryClient.invalidateQueries([QueryKeys.TaskList]);
    queryClient.invalidateQueries([QueryKeys.MainAccountBalance]);
    queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
    queryClient.invalidateQueries([
      QueryKeys.KplBalanceList,
      queryClient.getQueryData([QueryKeys.MainAccount]),
    ]);

    toast.success('Congrats! Your totals will be updated shortly.');
  };

  const { mutate: claimPendingRewards, isLoading: isClaimingRewards } =
    useMutation(claimRewards, {
      onMutate: () => {
        setFetchMyTasksEnabled(false);
      },
      onSuccess: handleSuccess,
      onError: (error: any) => {
        const tasksWithUnclaimedRewards = Number(error.numberOfFailedClaims);
        const notAllRewardsWereClaimed =
          tasksWithUnclaimedRewards < tasksWithClaimableRewardsRef.current;

        if (notAllRewardsWereClaimed) {
          handlePartialFailure();
        } else {
          handleFailure(error.errorMessage);
        }
      },
      retry: CLAIM_REWARDS_RETRY_VALUE,
    });

  const handleSecondaryActionClick = () => {
    if (isAddTaskView) {
      navigateToMyNode();
    } else {
      navigateToAvailableTasks();
    }
  };

  const getRewardsInfoBoxState = () => {
    if (runningTasksPubKeys?.length === 0) {
      return RewardsState.NoRunningTasks;
    }

    if (newRewardsAvailable) {
      return RewardsState.RewardReceived;
    }

    return RewardsState.TimeToNextReward;
  };

  const rewardsInfoBoxState = getRewardsInfoBoxState();

  return {
    nodeInfoData,
    rewardsInfoBoxState,
    isClaimingRewards,
    isAddTaskView,
    isRewardClaimable,
    handleClickClaim,
    handleAddFundsClick,
    handleSecondaryActionClick,
    navigateToMyNode,
    navigateToAvailableTasks,
    isLoadingNodeInfoData,
  };
};
