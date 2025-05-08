import { show } from '@ebay/nice-modal-react';

import { TokenTransferModal, PropsType } from '../modals/TokenTransferModal';

export const useTokenTransferModal = (props: PropsType) => {
  const showModal = () => {
    return show(TokenTransferModal, props);
  };

  return {
    showModal,
  };
};
