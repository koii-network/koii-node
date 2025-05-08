import React from 'react';

import { Tooltip } from 'renderer/components/ui';
import { AccountType } from 'renderer/features/settings/types';
import { useTokenTransferModal } from 'renderer/features/tokens/hooks';
import { TokenItemType } from 'renderer/features/tokens/types';

import { MoneyIconSVG } from './MoneyIconSVG';

type PropsType = {
  accountPublicKey: string;
  destinationAddress?: string;
  accountName: string;
  kplTokenItems: TokenItemType[];
  accountType: AccountType;
};

export function TransferKPLButton({
  accountName,
  accountPublicKey,
  destinationAddress,
  kplTokenItems,
  accountType,
}: PropsType) {
  const { showModal: showTransferKPLModal } = useTokenTransferModal({
    accountName,
    accountType,
    kplTokenItems,
    walletAddress: accountPublicKey,
    destinationAddress,
  });

  return (
    <Tooltip placement="top-left" tooltipContent="Transfer Funds">
      <button
        onClick={() => showTransferKPLModal()}
        className="flex items-center justify-center w-12 h-12 bg-transparent rounded-full"
      >
        <MoneyIconSVG />
      </button>
    </Tooltip>
  );
}
