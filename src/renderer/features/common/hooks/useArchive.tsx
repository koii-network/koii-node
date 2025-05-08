import { CheckSuccessLine } from '@_koii/koii-styleguide';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import {
  QueryKeys,
  archiveTask as archiveTaskService,
} from 'renderer/services';

interface Params {
  taskPublicKey: string;
  pendingRewards?: number;
}

function useArchive({ taskPublicKey, pendingRewards }: Params) {
  const queryClient = useQueryClient();

  const {
    mutate: archiveTask,
    isLoading: isArchivingTask,
    error: archiveTaskError,
  } = useMutation(() => archiveTaskService(taskPublicKey), {
    onSuccess: async () => {
      if (pendingRewards) {
        toast.success(
          'We sent the pending rewards from this task to your account.',
          {
            duration: 4500,
            icon: <CheckSuccessLine className="w-5 h-5" />,
            style: {
              backgroundColor: '#BEF0ED',
              paddingRight: 0,
            },
          }
        );
      }
      await queryClient.invalidateQueries([QueryKeys.taskNodeInfo]);
      await queryClient.invalidateQueries([
        QueryKeys.KplBalanceList,
        queryClient.getQueryData([QueryKeys.MainAccount]),
      ]);
      await queryClient.invalidateQueries([QueryKeys.MainAccountBalance]);
      queryClient.invalidateQueries([QueryKeys.TaskList]);
      queryClient.invalidateQueries(QueryKeys.availableTaskList);
    },
    retry: 10,
  });

  return { archiveTask, isArchivingTask, archiveTaskError };
}

export default useArchive;
