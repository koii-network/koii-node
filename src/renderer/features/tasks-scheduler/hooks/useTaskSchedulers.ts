import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery,
} from 'react-query';

import { ScheduleMetadata } from 'models';
import { QueryKeys, getTasksSchedulerSessions } from 'renderer/services';

export type ScheduleRefetchFuncType = <TPageData>(
  options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
) => Promise<QueryObserverResult<ScheduleMetadata[], unknown>>;

export const useTaskSchedulers = () => {
  const {
    data,
    isLoading,
    error,
    refetch: refetchSchedules,
  } = useQuery([QueryKeys.SchedulerSessions], getTasksSchedulerSessions);
  return {
    schedulerSessions: data,
    loadingSchedulerSessions: isLoading,
    schedulerSessionsLoadingError: error,
    refetchSchedules,
  };
};
