import { CurrencyMoneyFill, Icon } from '@_koii/koii-styleguide';
import React from 'react';

import { Button, Tooltip } from 'renderer/components/ui';
import { useTransferFundsModal } from 'renderer/features/common';

type PropsType = {
  accountPublicKey: string;
  accountName: string;
  accountType: 'STAKING' | 'SYSTEM';
};

export function TransferButton({
  accountName,
  accountPublicKey,
  accountType,
}: PropsType) {
  const { showModal: showTransferModal } = useTransferFundsModal({
    accountName,
    walletAddress: accountPublicKey,
    accountType,
  });

  return (
    <Tooltip placement="top-left" tooltipContent="Transfer Funds">
      <Button
        onClick={() => showTransferModal()}
        onlyIcon
        icon={
          <Icon
            source={CurrencyMoneyFill}
            className="-mt-0.5 -mr-0.5 w-5 h-5 text-finnieTeal-100"
          />
        }
        className="rounded-full w-6.5 h-6.5 bg-transparent"
      />
    </Tooltip>
  );
}
