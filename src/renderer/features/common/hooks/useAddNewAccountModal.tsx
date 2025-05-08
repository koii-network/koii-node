import { show } from '@ebay/nice-modal-react';

import { AddNewAccount } from '../modals';

export const useAddNewAccountModal = (pickCreateByDefault?: boolean) => {
  const showModal = (): Promise<string> => {
    return show(AddNewAccount, { pickCreateByDefault });
  };

  return {
    showModal,
  };
};
