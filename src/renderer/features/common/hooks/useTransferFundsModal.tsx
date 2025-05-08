import { show } from '@ebay/nice-modal-react';

import { TransferFunds } from '../modals/TransferFunds';

type ParamsType = {
  accountName: string;
  walletAddress: string;
  accountType: 'STAKING' | 'SYSTEM';
  onStakeActionSuccess?: () => Promise<unknown>;
};

export const useTransferFundsModal = ({
  accountName,
  walletAddress,
  accountType,
}: ParamsType) => {
  const showModal = (destinationAddress?: string) => {
    return show(TransferFunds, {
      accountName,
      walletAddress,
      accountType,
      destinationAddress,
    });
  };

  return {
    showModal,
  };
};
