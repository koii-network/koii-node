import { show } from '@ebay/nice-modal-react';

import { UpdatePinModal } from '../modals/UpdatePinModal';

export const useUpdatePinModal = () => {
  const showModal = () => {
    return show(UpdatePinModal);
  };

  return {
    showModal,
  };
};
