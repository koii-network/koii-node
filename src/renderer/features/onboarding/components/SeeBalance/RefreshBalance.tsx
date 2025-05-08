import { Icon } from '@_koii/koii-styleguide';
import React, { useCallback, useState } from 'react';

import ReloadSvg from 'assets/svgs/reload-icon-big.svg';
import { ErrorMessage } from 'renderer/components/ui/ErrorMessage';
import { useFundNewAccountModal } from 'renderer/features/common';
import {
  useMainAccountBalance,
  useRefreshMainAccountBalanceAction,
} from 'renderer/features/settings';

type PropsType = {
  onBalanceRefresh?: (balance: string | number) => void;
};

export function RefreshBalance({ onBalanceRefresh }: PropsType) {
  const {
    accountBalance: mainAccountBalance,
    loadingAccountBalance,
    accountBalanceLoadingError,
    isRefetchingAccountBalance,
  } = useMainAccountBalance({ onSuccess: onBalanceRefresh });
  const { refreshMainAccountBalance } = useRefreshMainAccountBalanceAction();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRefetch = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
    /**
     * Invalidate the cache to force a refetch
     */
    refreshMainAccountBalance();
    setTimeout(() => {
      /**
       * Invalidate the cache again after 2 seconds to ensure the balance is updated
       */
      refreshMainAccountBalance();
    }, 2000);
  }, [refreshMainAccountBalance]);

  const renderError = () => {
    if (accountBalanceLoadingError) {
      return <ErrorMessage error="Cant't fetch balance, try again" />;
    }
    return null;
  };

  const { showModal: showFundAccountModal } = useFundNewAccountModal();

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <button
          className={`w-[64px] h-[64px] p-2 hover:brightness-125 transition-all duration-300 ease-in-out rounded-full mb-4 cursor-pointer flex items-center justify-center ${
            isAnimating ? 'animate-rotate-once' : ''
          }`}
          onClick={handleRefetch}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRefetch();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full rounded-full bg-finniePurple">
            <Icon source={ReloadSvg} className="w-10 h-10  text-black" />
          </div>
        </button>
        <div className="mb-2 text-lg 2xl:text-xl font-semibold transition-all duration-300 ease-in-out">
          Refresh Balance
        </div>
        <div className="mb-2">
          {loadingAccountBalance || isRefetchingAccountBalance
            ? 'Checking balance...'
            : mainAccountBalance === 0 && 'Your balance is 0, try again'}
        </div>
        {renderError()}
      </div>
      <button
        className="inline-block underline cursor-pointer text-finnieTeal-100 mt-40 md2h:mt-72 transition-all duration-300 ease-in-out"
        onClick={showFundAccountModal}
      >
        Fund another way
      </button>
    </>
  );
}
