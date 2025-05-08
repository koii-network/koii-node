import { show } from '@ebay/nice-modal-react';

import { CreateTaskModal } from '../modals/CreateTask';

export const useCreateTaskModal = () => {
  const showModal = () => {
    show(CreateTaskModal);
  };

  return {
    showModal,
  };
};
