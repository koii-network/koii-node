import { show } from '@ebay/nice-modal-react';
import { useCallback } from 'react';

import { AddFunds, Props as AddFundsProps } from '../modals/AddFunds';

export const useFundNewAccountModal = ({
  accountPublicKey,
  onGoBack,
}: AddFundsProps = {}) => {
  const showModal = useCallback(() => {
    return show(AddFunds, { accountPublicKey, onGoBack });
  }, [accountPublicKey, onGoBack]);

  return {
    showModal,
  };
};
