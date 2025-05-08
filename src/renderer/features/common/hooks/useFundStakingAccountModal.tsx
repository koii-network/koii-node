import { show } from '@ebay/nice-modal-react';

import { AddStakingAccountFunds } from '../modals/AddStakingAccountFunds';

export const useFundStakingAccountModal = () => {
  const showModal = () => {
    return show(AddStakingAccountFunds);
  };

  return {
    showModal,
  };
};
