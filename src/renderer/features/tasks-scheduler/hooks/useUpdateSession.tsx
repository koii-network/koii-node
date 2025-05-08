import { useMutation, useQueryClient } from 'react-query';

import { ScheduleMetadataUpdateType } from 'models';
import { QueryKeys, updateSessionById } from 'renderer/services';
import { getErrorToDisplay } from 'renderer/utils';

type ParamsType = {
  onSessionUpdateError?: (message: string) => void;
  onSessionUpdateSuccess?: (data: {
    variables: ScheduleMetadataUpdateType;
  }) => void;
};

export const useUpdateSession = ({
  onSessionUpdateError,
  onSessionUpdateSuccess,
}: ParamsType = {}) => {
  const queryCache = useQueryClient();

  return useMutation(updateSessionById, {
    onSuccess: (_, variables) => {
      queryCache.invalidateQueries([QueryKeys.SchedulerSessions]);

      onSessionUpdateSuccess?.({
        variables,
      });
    },
    onError: (error) => {
      const errorMessage = getErrorToDisplay(error as string | Error);

      if (errorMessage) {
        onSessionUpdateError?.(errorMessage);
      }
    },
  });
};
