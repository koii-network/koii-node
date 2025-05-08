import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { TaskVariableDataWithId } from 'models/api';
import { Modal, ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

import { InspectTaskVariable } from './InspectTaskVariable';

interface Params {
  taskVariable: TaskVariableDataWithId;
}

export const InspectTaskVariableModal = create<Params>(
  function InspectTaskVariableModal({ taskVariable }) {
    const modal = useModal();

    return (
      <Modal>
        <ModalContent
          theme={Theme.Dark}
          className="text-left p-10 pt-5 h-fit rounded text-white flex flex-col gap-4 w-[840px]"
        >
          <InspectTaskVariable
            taskVariable={taskVariable}
            onRemove={modal.remove}
          />
        </ModalContent>
      </Modal>
    );
  }
);
