import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { RequirementType, TaskMetadata } from 'models';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

import { TaskDescription } from '../TaskInfo/components/TaskDescription';

export type TaskMetadataModalPropsType = {
  metadata?: TaskMetadata | null | undefined;
  taskId: string;
};

export const TaskMetadataModal = create<TaskMetadataModalPropsType>(
  function TaskDetailsModal({ metadata, taskId }) {
    const modal = useModal();
    const NOT_AVAILABLE = '-';
    const specs = metadata?.requirementsTags?.filter(({ type }) =>
      [
        RequirementType.CPU,
        RequirementType.RAM,
        RequirementType.STORAGE,
        RequirementType.ARCHITECTURE,
        RequirementType.OS,
        RequirementType.NETWORK,
      ].includes(type)
    );

    const handleClose = () => {
      modal.remove();
    };

    useCloseWithEsc({ closeModal: handleClose });

    const gridClass = twMerge('grid grid-cols-2 gap-y-2 text-white text-sm');
    const taskSpecificationClass = twMerge('w-full text-start');

    return (
      <Modal>
        <ModalContent theme={Theme.Dark} className="max-w-[1000px]">
          <ModalTopBar
            title="Task Description"
            onClose={handleClose}
            theme="dark"
          />
          <div className="p-3">
            <TaskDescription
              description={metadata?.description}
              taskId={taskId}
            />
          </div>
        </ModalContent>
      </Modal>
    );
  }
);
