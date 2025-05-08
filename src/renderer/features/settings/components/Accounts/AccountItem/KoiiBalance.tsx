import React from 'react';

import KoiiTokenLogo from 'assets/svgs/koii-token-logo.svg';

type PropsType = {
  accountBalanceInKoii?: number | string;
  usdBalance?: number;
};

export function KoiiBalance({ accountBalanceInKoii, usdBalance }: PropsType) {
  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <div className="text-2xl">{accountBalanceInKoii} KOII</div>
        <KoiiTokenLogo className="w-10 h-10" />
      </div>
      <div className="text-xs text-finnieGray-secondary">{`$${usdBalance} USD`}</div>
    </div>
  );
}
