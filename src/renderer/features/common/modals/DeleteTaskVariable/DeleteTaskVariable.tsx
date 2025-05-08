import { CloseLine, Icon, SettingsLine } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Task } from 'models';
import { TaskVariableDataWithId } from 'models/api';
import { Button, LoadingSpinner } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';
import { useStartedTasksPubKeys } from 'renderer/features/tasks';
import {
  deleteTaskVariable as deleteTaskVariableService,
  getTasksPairedWithVariable,
  QueryKeys,
  stopTask,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';

interface Params {
  taskVariable: TaskVariableDataWithId;
}

export const DeleteTaskVariable = create<Params>(function DeleteTaskVariable({
  taskVariable: { id, label },
}) {
  const queryClient = useQueryClient();

  const { mutate: deleteTaskVariable } = useMutation(
    deleteTaskVariableService,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([QueryKeys.StoredTaskVariables]);
        await queryClient.invalidateQueries([QueryKeys.TaskVariables]);
        await queryClient.invalidateQueries([
          QueryKeys.StoredPairedTaskVariables,
        ]);
        await queryClient.invalidateQueries([
          QueryKeys.StoredTaskPairedTaskVariables,
        ]);
      },
    }
  );

  const modal = useModal();

  const handleClose = () => {
    modal.resolve();
    modal.remove();
  };

  useCloseWithEsc({ closeModal: handleClose });

  const { data: startedTasksPubkeys, isLoading: loadingStartedTasksPubKeys } =
    useStartedTasksPubKeys();

  const {
    data: tasksPairedWithVariable,
    isLoading: loadingTasksPairedWithVariable,
  } = useQuery<Task[]>(
    [QueryKeys.TasksPairedWithVariable, id],
    () => getTasksPairedWithVariable(id),
    { enabled: !!startedTasksPubkeys }
  );

  const startedTasksPairedWithVariable =
    tasksPairedWithVariable?.filter(({ publicKey }) =>
      startedTasksPubkeys?.includes(publicKey)
    ) || [];

  const [isStoppingLinkedTasks, setIsStoppingLinkedTasks] = useState(false);

  const handleConfirm = async () => {
    setIsStoppingLinkedTasks(true);
    try {
      for (const task of startedTasksPairedWithVariable) {
        await stopTask(task.publicKey);
      }
    } catch (error) {
      console.error('Failed to stop linked tasks:', error);
    } finally {
      setIsStoppingLinkedTasks(false);
      queryClient.invalidateQueries([QueryKeys.TaskList]);
      deleteTaskVariable(id);
      handleClose();
    }
  };

  const isLoadingPairedTasks =
    loadingStartedTasksPubKeys || loadingTasksPairedWithVariable;

  const areThereTasksUisngThisTool = !!startedTasksPairedWithVariable?.length;

  return (
    <Modal>
      <ModalContent
        theme={Theme.Dark}
        className="p-5 pl-10 w-fit h-fit text-white rounded max-w-[840px]"
      >
        <div className="flex items-center justify-center w-full gap-4 pt-2 text-2xl font-semibold">
          <Icon source={SettingsLine} className="w-8 h-8" />
          <span>Delete Task Extension</span>
          <Icon
            source={CloseLine}
            className="w-8 h-8 ml-auto cursor-pointer"
            onClick={modal.remove}
          />
        </div>

        <div className="py-10 leading-8 text-left pr-14">
          <span> Are you sure you want to delete Task Extension </span>
          <span className="font-black">{label}</span>? This procedure cannot be
          undone and it will cause the tasks that consume this extension to
          stop.
        </div>

        {areThereTasksUisngThisTool && (
          <div className="mb-3 text-left mr-auto">
            TASKS USING THIS EXTENSION
          </div>
        )}

        {isLoadingPairedTasks ? (
          <div className="flex justify-center mb-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-12 mb-4">
            {startedTasksPairedWithVariable?.map(
              ({ publicKey, data: { taskName } }) => (
                <div key={publicKey} className="flex items-center gap-4 w-fit">
                  <span className="h-2.5 w-2.5 bg-finnieTeal-100" />
                  <span>{taskName}</span>
                </div>
              )
            )}
          </div>
        )}

        {isStoppingLinkedTasks ? (
          <div className="flex justify-center mb-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6 text-finnieBlue-light-secondary">
            <Button label="Keep" onClick={handleClose} className="bg-white" />
            <Button
              label="Delete"
              onClick={handleConfirm}
              className="bg-finnieRed"
            />
          </div>
        )}
      </ModalContent>
    </Modal>
  );
});
