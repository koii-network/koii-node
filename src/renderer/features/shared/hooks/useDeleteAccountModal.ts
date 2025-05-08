import { show } from '@ebay/nice-modal-react';

import { DeleteAccount, Props } from '../modals/DeleteAccount';

export const useDeleteAccountModal = ({ accountName }: Props) => {
  const showModal = () => {
    return show(DeleteAccount, { accountName });
  };

  return {
    showModal,
  };
};
