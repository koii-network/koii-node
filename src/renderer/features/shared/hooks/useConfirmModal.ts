import { show } from '@ebay/nice-modal-react';

import { ConfirmModal, Props } from '../modals/ConfirmModal';

type ParamsType = Props;

export const useConfirmModal = ({ header, content, icon }: ParamsType) => {
  const showModal = () => {
    const res = show(ConfirmModal, { header, content, icon });
    return res as Promise<boolean>;
  };

  return {
    showModal,
  };
};
