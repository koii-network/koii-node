import { show } from '@ebay/nice-modal-react';

import { TaskVariableDataWithId } from 'models/api';

import { DeleteTaskVariable } from '../modals/DeleteTaskVariable';

export const useDeleteTaskVariable = (taskVariable: TaskVariableDataWithId) => {
  const showModal = () => {
    show(DeleteTaskVariable, { taskVariable });
  };

  return {
    showModal,
  };
};
