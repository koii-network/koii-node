import { show } from '@ebay/nice-modal-react';

import { TaskVariableDataWithId } from 'models/api';

import { InspectTaskVariableModal } from '../modals/InspectTaskVariable';

export const useInspectTaskVariable = (
  taskVariable: TaskVariableDataWithId
) => {
  const showModal = () => {
    show(InspectTaskVariableModal, { taskVariable });
  };

  return {
    showModal,
  };
};
