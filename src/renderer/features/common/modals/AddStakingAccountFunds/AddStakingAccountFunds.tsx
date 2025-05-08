import { CloseLine, CurrencyMoneyLine, Icon } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React, { useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import {
  Button,
  ErrorMessage,
  LoadingSpinner,
  LoadingSpinnerSize,
} from 'renderer/components/ui';
import { KoiiInputNew } from 'renderer/components/ui/KoiiInput';
import { Modal, ModalContent } from 'renderer/features/modals';
import {
  useAccountBalance,
  useMainAccount,
  useStakingAccount,
} from 'renderer/features/settings/hooks';
import { QueryKeys, fundStakingWalletFromMainWallet } from 'renderer/services';
import { Theme } from 'renderer/types/common';
import { getKoiiFromRoe, getRoeFromKoii } from 'utils';

import { RetryFund } from './RetryFund';

export type PropsType = {
  onWalletFundSuccess: () => void;
};

const getDefaultFundValueInKoii = (accountBalance: number) => {
  if (accountBalance > 20) {
    return 10;
  }

  if (accountBalance >= 10 && accountBalance <= 20) {
    return 5;
  }

  return 2;
};

export const AddStakingAccountFunds = create<PropsType>(
  function AddStakingAccountFunds() {
    const [inputValue, setInputValue] = React.useState<number>();
    const { data: mainAccountPublicKey } = useMainAccount();
    const { data: stakingPublicKey } = useStakingAccount();
    const { accountBalance } = useAccountBalance(mainAccountPublicKey);
    const accountBalanceInKoii =
      accountBalance && getKoiiFromRoe(accountBalance);

    const modal = useModal();

    const insufficientFunds = accountBalance && accountBalance < 0;

    const displayNotEnoughFundsError = insufficientFunds;

    useEffect(() => {
      const defaultFundValue =
        accountBalanceInKoii && getDefaultFundValueInKoii(accountBalanceInKoii);
      setInputValue(defaultFundValue);
    }, [accountBalanceInKoii]);

    const handleStakingWalletFund = async () => {
      if (!inputValue) {
        return;
      }
      const valueInRoe = inputValue && getRoeFromKoii(inputValue);
      await fundStakingWalletFromMainWallet(valueInRoe);
    };

    const queryCache = useQueryClient();

    const invalidateQueries = () => {
      queryCache.invalidateQueries([
        QueryKeys.AccountBalance,
        stakingPublicKey,
      ]);
      queryCache.invalidateQueries([
        QueryKeys.MainAccountBalance,
        mainAccountPublicKey,
      ]);
    };

    const {
      mutate,
      isLoading: fundingStakingWalletLoading,
      isError,
    } = useMutation(handleStakingWalletFund, {
      onSuccess: () => {
        invalidateQueries();
        modal.remove();
      },
    });

    const handleFundStakingWallet = () => {
      mutate();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setInputValue(Number(value));
    };

    return (
      <Modal>
        <ModalContent
          theme={Theme.Dark}
          className="justify-center items-center p-5 pl-10 w-max  gap-5 h-fit rounded text-white flex flex-col min-w-[582px]"
        >
          <div className="flex items-center justify-center w-full gap-4 text-2xl font-semibold">
            <Icon source={CurrencyMoneyLine} className="w-8 h-8" />
            <span>Fund Staking Key</span>
            <Icon
              source={CloseLine}
              className="w-8 h-8 ml-auto cursor-pointer"
              onClick={modal.remove}
            />
          </div>

          {isError && !fundingStakingWalletLoading ? (
            <RetryFund handleRetry={handleFundStakingWallet} />
          ) : (
            <>
              <p>
                {fundingStakingWalletLoading
                  ? 'Hang on, we’re transferring your tokens...'
                  : 'Add tokens to keep your staking account active.'}
              </p>

              {!fundingStakingWalletLoading && (
                <>
                  <KoiiInputNew
                    value={inputValue}
                    onInputChange={handleInputChange}
                  />

                  <div className="h-6 text-center">
                    {displayNotEnoughFundsError ? (
                      <ErrorMessage
                        error="You don’t have enough funds. Run more tasks to earn!"
                        className="text-xs"
                      />
                    ) : (
                      <div className="text-sm text-green-2">{`${accountBalanceInKoii} KOII available in your balance`}</div>
                    )}
                  </div>
                </>
              )}

              {!fundingStakingWalletLoading ? (
                <Button
                  label="Fund Now"
                  onClick={handleFundStakingWallet}
                  disabled={fundingStakingWalletLoading}
                  className="w-56 h-12 m-auto mb-2 font-semibold rounded-md bg-finnieGray-tertiary text-finnieBlue-light"
                />
              ) : (
                <div className="flex flex-col items-center mt-10 mb-2">
                  <LoadingSpinner size={LoadingSpinnerSize.XLarge} />
                  <p className="text-green-2">
                    This will take a couple seconds...
                  </p>
                </div>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
);
