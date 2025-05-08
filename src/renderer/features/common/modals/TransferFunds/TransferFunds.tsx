import { create, useModal } from '@ebay/nice-modal-react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import {
  Button,
  ErrorMessage,
  KoiiInputNew,
  LoadingSpinner,
} from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import { useStakingAccount } from 'renderer/features/settings/hooks';
import {
  getAccountBalance,
  getRentAmount,
  QueryKeys,
  transferKoiiFromMainWallet,
  transferKoiiFromStakingWallet,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';
import { getKoiiFromRoe } from 'utils';

type PropsType = {
  accountName: string;
  walletAddress: string;
  accountType: 'STAKING' | 'SYSTEM';
  destinationAddress?: string;
};

export const TransferFunds = create<PropsType>(function AddStake({
  accountName,
  walletAddress,
  accountType,
  destinationAddress,
}) {
  const modal = useModal();

  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [destinationWallet, setDestinationWallet] = useState(
    destinationAddress || ''
  );

  const sendTokensApiCall = async () => {
    const trimmedWallet = destinationWallet.trim();
    if (accountType === 'SYSTEM') {
      await transferKoiiFromMainWallet(accountName, amount, trimmedWallet);
    } else {
      await transferKoiiFromStakingWallet(accountName, amount, trimmedWallet);
    }
    console.log({ accountName });
  };

  const { data: stakingAccountPublicKey } = useStakingAccount();

  const { data: rentAmount = 1 } = useQuery(
    [QueryKeys.RentAmount, stakingAccountPublicKey],
    getRentAmount
  );

  const {
    mutate: sendTokens,
    isLoading: isSending,
    error: errorSending,
    isError,
  } = useMutation(sendTokensApiCall, {
    onSuccess: () => {
      handleClose();
    },
  });

  const getWalletAccountBalance = async () => {
    const balanceInRoe = await getAccountBalance(walletAddress);
    const balanceInKoii = getKoiiFromRoe(balanceInRoe);
    return balanceInKoii;
  };

  const { data: balance = 0 } = useQuery(
    [walletAddress],
    getWalletAccountBalance
  );

  const queryClient = useQueryClient();

  const handleClose = () => {
    modal.resolve(true);
    modal.remove();

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.AccountBalance, walletAddress],
    });
  };

  useCloseWithEsc({ closeModal: handleClose });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const transferAmount = +e.target.value;
    const hasMinimumRentAmount = transferAmount > balance - rentAmount;
    if (transferAmount > balance) {
      setError('Not enough balance');
    }
    if (accountType === 'STAKING' && hasMinimumRentAmount) {
      setError(
        `You cannot withdraw all tokens, Need to have at least ${rentAmount} tokens in staking account for rent fees`
      );
    }
    setAmount(transferAmount);
  };
  const handleDestinationWalletChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const destinationWalletVal = e.target.value;
    setDestinationWallet(destinationWalletVal);
  };

  const confirmSendTokens = () => sendTokens();

  return (
    <Modal>
      <ModalContent className="w-[700px]" theme={Theme.Dark}>
        <ModalTopBar
          title="Transfer Funds"
          onClose={handleClose}
          theme="dark"
        />
        <div className="flex flex-col items-center justify-center gap-5 py-8 text-white h-84">
          <div className="px-5">
            Enter the wallet address and amount below to transfer your tokens
            <br />
            from this wallet.
          </div>
          <div className="flex flex-col mb-2 w-80">
            <label htmlFor="setting-label" className="mb-0.5 text-left">
              Destination Wallet
            </label>
            <div className="flex items-center justify-center px-4 py-2 space-x-1 text-white duration-500 rounded-md w-80 bg-finnieBlue-light-tertiary transition-width">
              <input
                className="w-full h-10 text-md text-center text-white bg-transparent outline-none max-w-[246px]"
                type="text"
                value={destinationWallet}
                onChange={handleDestinationWalletChange}
                placeholder="Enter Destination wallet address"
              />
            </div>
          </div>
          <div>
            <div className="flex flex-col w-80">
              <label htmlFor="setting-label" className="mb-0.5 text-left">
                Amount To Send
              </label>
            </div>
            <KoiiInputNew onInputChange={handleInputChange} className="w-80" />
            <div className="h-12 -mt-2 -mb-10 -pt-2 w-80">
              {(error || isError) && (
                <ErrorMessage error={error || (errorSending as Error)} />
              )}
            </div>
          </div>
          <div className="py-2 text-xs text-finnieTeal-100">
            {!error
              ? `${balance} KOII available in your balance`
              : '                   '}
          </div>
          {isSending ? (
            <LoadingSpinner className="w-10 h-10 mx-auto" />
          ) : (
            <Button
              label="Send Tokens"
              onClick={confirmSendTokens}
              className="py-5 mt-3 text-finnieBlue-dark bg-finnieGray-100"
              loading={isSending}
              disabled={!!error || !amount || isSending || !destinationWallet}
            />
          )}
        </div>
      </ModalContent>
    </Modal>
  );
});
