import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { Button } from 'renderer/components/ui';
import { renderCustomToast } from 'renderer/features/notifications/toasts/CustomToast';
import { QueryKeys, archiveTask } from 'renderer/services';

type PropsType = {
  taskPublicKey: string;
};

export function useForceArchive({ taskPublicKey }: PropsType) {
  const queryCache = useQueryClient();

  const [forceArchiveToastId, setForceArchiveToastId] = useState<string | null>(
    null
  );

  const handleForceArchiveError = (error: Error) => {
    console.log(error);
    const taskWasDeletedOnChain =
      error.message
        .toLowerCase()
        .includes('incorrect program id for instruction') ||
      error.message
        .toLowerCase()
        .includes('invalid account data for instruction');

    if (taskWasDeletedOnChain) {
      const toastId = renderCustomToast({
        content: (
          <div className="flex flex-col gap-4 items-center">
            <p>
              The account for this task seems to have been deleted on-chain, do
              you want to force archiving it?
            </p>
            <p>
              Any staked tokens and pending rewards from this task will be lost.
            </p>
            <Button
              label="Force Archive"
              className="text-finnieRed"
              onClick={() => forceArchiveTask()}
            />
          </div>
        ),
        dismissable: true,
        variant: 'error',
      });

      setForceArchiveToastId(toastId);
    }
  };

  const { mutate: forceArchiveTask } = useMutation(
    () => archiveTask(taskPublicKey, true),
    {
      onSuccess: async () => {
        toast.success('Task archived successfully');

        await queryCache.invalidateQueries([QueryKeys.taskNodeInfo]);
        queryCache.invalidateQueries([QueryKeys.TaskList]);
        queryCache.invalidateQueries(QueryKeys.availableTaskList);
        if (forceArchiveToastId) toast.dismiss(forceArchiveToastId);
      },
    }
  );

  return {
    handleForceArchiveError,
  };
}
