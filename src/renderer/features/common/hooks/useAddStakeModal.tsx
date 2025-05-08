import { show } from '@ebay/nice-modal-react';

import { TaskMetadata } from 'models';
import { Task } from 'renderer/types';

import { AddStake } from '../modals/AddStake';

type ParamsType = {
  task: Task;
  metadata?: TaskMetadata | null;
  onStakeActionSuccess?: () => Promise<unknown>;
  isPrivate?: boolean;
  kplToken?: any;
};

export const useAddStakeModal = ({
  task,
  metadata,
  isPrivate,
  kplToken,
}: ParamsType) => {
  const showModal = () => {
    return show(AddStake, { task, metadata, isPrivate, kplToken });
  };

  return {
    showModal,
  };
};
