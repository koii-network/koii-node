import { useQuery } from 'react-query';

import {
  QueryKeys,
  getLatestTasksById,
  getOnboardingTaskIds,
} from 'renderer/services';

export const useDefaultTasks = () => {
  const {
    isLoading,
    error,
    data: verifiedTasks = [],
  } = useQuery(
    [QueryKeys.OnboardingTasks],
    () =>
      withTimeout(
        getOnboardingTaskIds().then((tasksAllowedOnOnboarding) =>
          getLatestTasksById(tasksAllowedOnOnboarding)
        ),
        20000
      ),
    {
      onError(error) {
        console.error(error);
      },
      retry: true,
    }
  );

  return {
    verifiedTasks,
    isLoading,
    error,
  };
};

function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Promise timed out'));
    }, timeout);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
}
