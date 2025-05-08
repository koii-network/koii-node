import { AddLine, Icon } from '@_koii/koii-styleguide';
import React, { useMemo } from 'react';

import { LoadingSpinner } from 'renderer/components/ui';
import { useAddNewAccountModal } from 'renderer/features/common/hooks/useAddNewAccountModal';

import { useAccounts } from '../../hooks';
import { useKoiiPrice } from '../../hooks/useKoiiPrice';

import { AccountItem } from './AccountItem';

export function AccountsTable() {
  const { showModal } = useAddNewAccountModal();
  const { accounts, loadingAccounts } = useAccounts();
  const accountsSorted = useMemo(
    () => (accounts ?? []).sort((a) => (a.isDefault ? -1 : 0)),
    [accounts]
  );

  const { data: koiiPrice, isLoading: isLoadingPrice } = useKoiiPrice();

  if (loadingAccounts) {
    return <LoadingSpinner className="w-40 h-40 mx-auto mt-40" />;
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        {accountsSorted.map(
          ({
            accountName,
            mainPublicKey,
            stakingPublicKey,
            kplStakingPublicKey,
            isDefault,
          }) => (
            <div key={accountName} className="py-4">
              <AccountItem
                systemKey={mainPublicKey}
                stakingKey={stakingPublicKey}
                kplStakingKey={kplStakingPublicKey}
                accountName={accountName}
                isDefault={isDefault}
                koiiPrice={koiiPrice ?? 0}
              />
            </div>
          )
        )}
      </div>
      <div className="sticky bottom-0 pt-4 pb-0">
        <button
          onClick={showModal}
          className="flex items-center text-sm text-finnieTeal-100 underline-offset-2"
        >
          <Icon source={AddLine} className="h-[18px] w-[18px] mr-2" />
          Add new account
        </button>
      </div>
    </div>
  );
}
