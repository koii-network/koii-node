import { show } from '@ebay/nice-modal-react';

import { Task } from 'renderer/types';

import { Unstake } from '../modals/Unstake';

type ParamsType = {
  task: Task;
};

export const useUnstakeModal = ({ task }: ParamsType) => {
  const showModal = () => {
    return show(Unstake, { task });
  };

  return {
    showModal,
  };
};
