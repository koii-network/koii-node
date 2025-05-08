import { show } from '@ebay/nice-modal-react';

import { NotEnoughFunds } from '../modals/NotEnoughFunds';

export const useNotEnoughFunds = () => {
  const showNotEnoughFunds = () => {
    return show(NotEnoughFunds);
  };

  return {
    showNotEnoughFunds,
  };
};
