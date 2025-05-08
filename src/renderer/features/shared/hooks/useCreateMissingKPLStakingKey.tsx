import { show } from '@ebay/nice-modal-react';

import { CreateMissingKPLStakingKey } from 'renderer/features/common/modals/CreateMissingKPLStakingKey';

type ParamsType = {
  accountName?: string;
  publicKey?: string;
};

export const useCreateMissingKPLStakingKey = (payload: ParamsType = {}) => {
  const showModal = () => {
    return show(CreateMissingKPLStakingKey, payload);
  };

  return {
    showModal,
  };
};
