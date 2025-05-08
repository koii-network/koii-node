import { show } from '@ebay/nice-modal-react';

import { AddTaskVariable } from '../modals/AddTaskVariable';

export const useAddTaskVariableModal = () => {
  const showModal = (presetLabel: string): Promise<boolean> => {
    return show(AddTaskVariable, { presetLabel });
  };

  return {
    showModal,
  };
};
