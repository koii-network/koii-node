import { useMutation, useQueryClient } from 'react-query';

import { useOnboardingContext } from 'renderer/features/onboarding/context/onboarding-context';
import { QueryKeys, stakeOnTask, startTask } from 'renderer/services';
import { TaskWithStake } from 'renderer/types';
import { getErrorToDisplay } from 'renderer/utils';

type UseRunMultipleTasksParams = {
  tasksToRun: TaskWithStake[];
  onRunAllTasksSuccessCallback?: () => void;
};

// TO DO: simplify all this to only use a single task, as at the very least for a long time that will be the case and this is ridiculously overkill
export const useRunMultipleTasks = ({
  tasksToRun,
  onRunAllTasksSuccessCallback,
}: UseRunMultipleTasksParams) => {
  const { setIsAttemptingToRunFirstTask } = useOnboardingContext();

  const handleRunTasks = async () => {
    setIsAttemptingToRunFirstTask(true);
    const errorMessages: string[] = [];
    const stakeOnTasksPromises = tasksToRun
      /**
       * @dev do not include staking action promise if there is no stake
       */
      .filter(({ stake }) => stake > 0)
      .map(
        async ({
          stake,
          publicKey,
          minimumStakeAmount,
          stakePotAccount,
          taskType,
          tokenType,
        }) => {
          const currentTaskStake = await window.main.getMyTaskStake({
            taskAccountPubKey: publicKey,
            revalidate: true,
            shouldCache: false,
            taskType: taskType || 'KOII',
          });
          const userAlreadyStakedOnTask =
            currentTaskStake > 0 && currentTaskStake >= minimumStakeAmount;

          try {
            if (!userAlreadyStakedOnTask) {
              await stakeOnTask({
                taskAccountPubKey: publicKey,
                stakeAmount: stake,
                isNetworkingTask: false,
                useStakingWallet: false,
                stakePotAccount,
                skipIfItIsAlreadyStaked: true,
                taskType: taskType || 'KOII',
                mintAddress: tokenType,
              });
            }
            await startTask(publicKey, false, true);
          } catch (error: any) {
            const errorMessage = getErrorToDisplay(error);
            console.error(errorMessage);
            errorMessages.push(
              errorMessage || 'Something went wrong. Please try again.'
            );
          }
        }
      );

    await Promise.all(stakeOnTasksPromises);

    if (errorMessages.length > 0) {
      throw errorMessages;
    }
  };

  const queryClient = useQueryClient();

  const {
    mutate: runAllTasks,
    isLoading: runTasksLoading,
    error: runTasksError,
  } = useMutation<void, string[]>(handleRunTasks, {
    onMutate: () => {
      setIsAttemptingToRunFirstTask(true);
    },
    onSuccess: () => {
      if (onRunAllTasksSuccessCallback) {
        onRunAllTasksSuccessCallback();
      }
    },
    onError: () =>
      queryClient.invalidateQueries([
        QueryKeys.TaskStake,
        tasksToRun[0].publicKey,
        false,
      ]),
    onSettled: () => {
      setIsAttemptingToRunFirstTask(false);
    },
    retry: 3,
  });

  return {
    runAllTasks,
    runTasksError,
    runTasksLoading,
  };
};
