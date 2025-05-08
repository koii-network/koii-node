import { Icon, CurrencyMoneyLine } from '@_koii/koii-styleguide';
import React from 'react';

import { Button, Tooltip } from 'renderer/components/ui';
import { useFundNewAccountModal } from 'renderer/features/common';

type PropsType = {
  accountPublicKey?: string;
};

export function FundButton({ accountPublicKey }: PropsType) {
  const { showModal: showFundModal } = useFundNewAccountModal({
    accountPublicKey,
  });

  return (
    <Tooltip placement="top-left" tooltipContent="Add Funds">
      <Button
        onClick={showFundModal}
        onlyIcon
        icon={
          <Icon
            source={CurrencyMoneyLine}
            className="-mt-0.5 -mr-0.5 w-5 h-5 text-finnieTeal-100"
          />
        }
        className="rounded-full w-6.5 h-6.5 bg-transparent"
      />
    </Tooltip>
  );
}
