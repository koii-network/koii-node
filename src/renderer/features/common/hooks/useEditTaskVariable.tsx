import { show } from '@ebay/nice-modal-react';

import { TaskVariableDataWithId } from 'models/api';

import { EditTaskVariable } from '../modals/EditTaskVariable';

export const useEditTaskVariable = (taskVariable: TaskVariableDataWithId) => {
  const showModal = () => {
    show(EditTaskVariable, { taskVariable });
  };

  return {
    showModal,
  };
};
