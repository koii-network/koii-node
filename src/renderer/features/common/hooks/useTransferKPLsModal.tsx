import { show } from '@ebay/nice-modal-react';

import { TransferKPLs } from '../modals/TransferKPLs';

type ParamsType = {
  accountName: string;
  walletAddress: string;
  mint: string;
  tokenSymbol: string;
};

export const useTransferKPLsModal = ({
  accountName,
  walletAddress,
  mint,
  tokenSymbol,
}: ParamsType) => {
  const showModal = (destinationAddress?: string) => {
    return show(TransferKPLs, {
      accountName,
      walletAddress,
      destinationAddress,
      mint,
      tokenSymbol,
    });
  };

  return {
    showModal,
  };
};
