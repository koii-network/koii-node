import { CloseLine, FlagReportLine, Icon } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';
import { useMyTaskStake } from 'renderer/features/tasks/hooks/useMyTaskStake';
import { TaskService } from 'renderer/services';
import { Task } from 'renderer/types';
import { Theme } from 'renderer/types/common';

import { TaskDetails } from './TaskDetails';

export type TaskDetailsModalPropsType = {
  task: Task;
  publicKey: string;
};

export const TaskDetailsModal = create<TaskDetailsModalPropsType>(
  function TaskDetailsModal({ task }) {
    const modal = useModal();
    const { data: taskStake } = useMyTaskStake(task.publicKey, task.taskType);

    const totalStake = TaskService.getTotalStaked(task);
    const nodes = TaskService.getNodesCount(task);
    const topStake = TaskService.getTopStake(task);

    const handleClose = () => {
      modal.remove();
    };

    useCloseWithEsc({ closeModal: handleClose });

    return (
      <Modal>
        <ModalContent
          theme={Theme.Dark}
          className="text-white w-[900px] h-[350px] rounded"
        >
          <div className="flex flex-col h-full px-8 py-6">
            <div className="flex justify-between">
              <div className="flex justify-start gap-6 pl-6 mb-5">
                <div className="border-b-2 border-finnieEmerald-light text-semibold">
                  Details
                </div>
              </div>
              <Icon
                source={CloseLine}
                className="w-8 h-8 cursor-pointer"
                onClick={handleClose}
              />
            </div>

            <div className="flex items-center w-full mb-5">
              <Icon
                source={FlagReportLine}
                className="w-3 h-5 text-[#ECFFFE]"
              />
              <div className="pl-[14px] pr-[14px]">
                Inspect{' '}
                <span className="text-finnieEmerald-light">
                  {task.taskName}
                </span>{' '}
                Source Code
              </div>
            </div>

            <div className="overflow-y-auto">
              <div className="pl-6">
                <TaskDetails
                  owner={task.taskManager}
                  totalBounty={task.totalBountyAmount}
                  nodesParticipating={nodes}
                  totalKoiiStaked={totalStake}
                  currentTopStake={topStake}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  myCurrentStake={taskStake!}
                />
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    );
  }
);
