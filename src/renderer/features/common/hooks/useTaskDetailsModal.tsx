import { show } from '@ebay/nice-modal-react';

import { Task } from 'renderer/types';

import { TaskDetailsModal } from '../modals/TaskDetails';

type ParamsType = {
  task: Task;
  accountPublicKey: string;
};

export const useTaskDetailsModal = ({ task, accountPublicKey }: ParamsType) => {
  const showModal = () => {
    show(TaskDetailsModal, { task, publicKey: accountPublicKey });
  };

  return {
    showModal,
  };
};
