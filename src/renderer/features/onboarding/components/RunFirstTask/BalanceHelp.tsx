/* eslint-disable @cspell/spellchecker */
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  InformationCircleLine,
} from '@_koii/koii-styleguide';
import React, { useState } from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useRefreshMainAccountBalanceAction } from 'renderer/features/settings';

export function BalanceHelp() {
  const { refreshMainAccountBalance } = useRefreshMainAccountBalanceAction();
  const [loading, setLoading] = useState(false);

  const handleRefreshBalance = async () => {
    try {
      setLoading(true);
      await refreshMainAccountBalance();
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing balance', error);
    }
  };

  const tooltipContent = (
    <div className="w-[300px] p-2 flex flex-col items-center">
      <div className="mb-[4px] leading-6">
        <p>
          If you have recently sent tokens to your new account, you may need to
          refresh your balance to see the updated amount. Transactions on the
          <span className="font-bold fill-finnieBlue"> Koii</span> blockchain
          are usually fast but may occasionally take longer to be processed and
          reflected in your account due to network congestion or high demand.
        </p>
        <p>
          Additionally, updates to your balance might not be immediately visible
          due to the time it takes for the network to reach consensus and for
          the transaction to be fully confirmed. This is a normal part of
          ensuring the security and integrity of transactions on the blockchain.
        </p>
      </div>
      <Button
        label={loading ? 'Refreshing balance...' : 'Refresh balance'}
        size={ButtonSize.SM}
        variant={ButtonVariant.SecondaryDark}
        disabled={loading}
        onClick={handleRefreshBalance}
      />
    </div>
  );
  return (
    <div className="flex items-center gap-2 mt-3 text-xs text-finnieGray">
      Can&apos;t see your balance updated?
      <Popover tooltipContent={tooltipContent}>
        <Icon
          size={18}
          source={InformationCircleLine}
          className="cursor-pointer"
        />
      </Popover>
    </div>
  );
}
