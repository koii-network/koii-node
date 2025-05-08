import { create, useModal } from '@ebay/nice-modal-react';
import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Button, ErrorMessage, LoadingSpinner } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent, ModalTopBar } from 'renderer/features/modals';
import {
  useAccountBalance,
  useStakingAccount,
} from 'renderer/features/settings/hooks';
import { AccountType } from 'renderer/features/settings/types';
import { WalletAddressInput } from 'renderer/features/shared/components/WalletAddressInput';
import {
  getRentAmount,
  QueryKeys,
  transferKoiiFromMainWallet,
  transferKoiiFromStakingWallet,
  transferKplToken,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';
import {
  getDenominationFromMainUnit,
  getFullKoiiFromRoe,
  getKoiiFromRoe,
  getRoeFromKoii,
} from 'utils/currencyConversion';

import { KplTokenInput } from '../components/KplTokenInput/KplTokenInput';
import { TokenItemType } from '../types';

export type PropsType = {
  accountName: string;
  walletAddress: string;
  accountType: AccountType;
  destinationAddress?: string;
  kplTokenItems: TokenItemType[];
};

export const TokenTransferModal = create<PropsType>(
  function TokenTransferModal({
    accountName,
    walletAddress,
    accountType,
    destinationAddress,
    kplTokenItems = [],
  }) {
    const queryClient = useQueryClient();
    const modal = useModal();
    const [amount, setAmount] = useState<number>(0);
    const [tokenToTransfer, setTokenToTransfer] = useState<TokenItemType>();
    const [error, setError] = useState('');
    const [destinationWallet, setDestinationWallet] = useState(
      destinationAddress || ''
    );

    const sendTokensApiCall = async () => {
      const isKoiiTokenSelected =
        tokenToTransfer?.name === 'Koii' && tokenToTransfer?.symbol === 'KOII';

      const trimmedWallet = destinationWallet.trim();

      if (!tokenToTransfer) {
        setError('Please select a token');
        return;
      }

      if (isKoiiTokenSelected) {
        const amoutnAsKoii = getFullKoiiFromRoe(amount);

        if (accountType === 'SYSTEM') {
          await transferKoiiFromMainWallet(
            accountName,
            amoutnAsKoii,
            trimmedWallet
          );
        } else {
          await transferKoiiFromStakingWallet(
            accountName,
            amoutnAsKoii,
            trimmedWallet
          );
        }
      } else {
        await transferKplToken({
          accountName,
          tokenMintAddress: tokenToTransfer.mint,
          amount,
          toWallet: trimmedWallet,
          accountType,
        });
      }
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
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.KplBalanceList, walletAddress],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.KplBalanceList, destinationWallet],
        });
        handleClose();
      },
    });

    const { accountBalance: koiiTokenBalance = 0 } =
      useAccountBalance(walletAddress);

    const koiiTokenBalanceInKoii = useMemo(
      () => getKoiiFromRoe(koiiTokenBalance),
      [koiiTokenBalance]
    );

    const handleClose = () => {
      modal.resolve(true);
      modal.remove();
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.AccountBalance, walletAddress],
      });
    };

    useCloseWithEsc({ closeModal: handleClose });

    const handleKoiiTokenInput = (
      transferAmount: number,
      tokenToTransferData: TokenItemType
    ) => {
      const transferAmountInROE = getRoeFromKoii(transferAmount);

      if (!transferAmountInROE) {
        setError('Invalid amount');
        return;
      }

      const exceedingAvailableTranferAmont =
        transferAmountInROE > koiiTokenBalance - rentAmount;

      if (accountType === 'STAKING' && exceedingAvailableTranferAmont) {
        setError(
          `You cannot withdraw all tokens. You need to have at least ${rentAmount} tokens in staking account for rent fees`
        );
      }

      const exceedingAvailableBalance = transferAmountInROE > koiiTokenBalance;

      if (exceedingAvailableBalance) {
        setError('Not enough balance');
        return;
      }

      setTokenToTransfer(tokenToTransferData);
      setAmount(transferAmountInROE);
    };

    const handleKplTokenInput = (
      transferAmount: number,
      tokenToTransferData: TokenItemType
    ) => {
      const transferAmountInDenomination = getDenominationFromMainUnit(
        transferAmount,
        tokenToTransferData.decimals ?? 9
      );

      if (!transferAmountInDenomination) {
        setError('Invalid amount');
        return;
      }

      const exceedingAvailableTranferAmont =
        transferAmountInDenomination > tokenToTransferData.balance;

      if (exceedingAvailableTranferAmont) {
        setError('Not enough balance');
        return;
      }

      setTokenToTransfer(tokenToTransferData);
      setAmount(transferAmountInDenomination);
    };

    const handleInputChange = (
      transferAmount: number | undefined,
      tokenToTransferData: TokenItemType
    ) => {
      const isKoiiTokenSelected =
        tokenToTransferData.name === 'Koii' &&
        tokenToTransferData.symbol === 'KOII';
      const isLeavingTheMinimumKOIIForRentFees =
        koiiTokenBalanceInKoii - (transferAmount || 2) >= 2;
      const isAboveMinTransferAmount = transferAmount && transferAmount >= 1;

      if (accountType === 'KPL_STAKING' && isKoiiTokenSelected) {
        setError(
          'Currently, only KPL token transfers are permitted from the KPL Staking Key'
        );
        return;
      }
      if (
        isKoiiTokenSelected &&
        !isAboveMinTransferAmount &&
        accountType === 'STAKING'
      ) {
        setError(
          'KOII transfers from staking accounts require a minimum of 1 KOII'
        );
        return;
      } else if (
        accountType === 'STAKING' &&
        isKoiiTokenSelected &&
        !isLeavingTheMinimumKOIIForRentFees
      ) {
        setError(
          'You should leave at least 2 KOII in your staking account for rent fees'
        );
        return;
      } else if (transferAmount === undefined || transferAmount < 0) {
        setError('Amount should be greater than 0');
        return;
      }

      setError('');

      if (isKoiiTokenSelected) {
        handleKoiiTokenInput(transferAmount, tokenToTransferData);
      } else {
        handleKplTokenInput(transferAmount, tokenToTransferData);
      }
    };

    const filteredKplTokenItems = useMemo(() => {
      if (accountType === 'KPL_STAKING') {
        return kplTokenItems.filter((token) => token.symbol !== 'KOII');
      }
      return kplTokenItems;
    }, [kplTokenItems, accountType]);

    return (
      <Modal>
        <ModalContent className="w-[680px]" theme={Theme.Dark}>
          <ModalTopBar
            title="Transfer Funds"
            onClose={handleClose}
            theme="dark"
          />
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-white h-84">
            <div className="pt-4 pb-8">
              Enter the wallet address and amount below to transfer your tokens
              <br />
              from this wallet.
            </div>
            <WalletAddressInput
              onChange={(val) => setDestinationWallet(val)}
              value={destinationWallet}
            />
            <div>
              <KplTokenInput
                onInputChange={handleInputChange}
                className="w-80"
                kplTokenItems={filteredKplTokenItems}
                koiiTokenBalance={koiiTokenBalanceInKoii}
                disableKoiiToken={accountType === 'KPL_STAKING'}
              />

              <div className="h-12 -mt-2 -mb-10 -pt-2 w-full">
                {(error || isError) && (
                  <ErrorMessage error={error || (errorSending as Error)} />
                )}
              </div>
            </div>
            {isSending ? (
              <LoadingSpinner className="w-10 h-10 mx-auto" />
            ) : (
              <Button
                label="Send Tokens"
                onClick={() => sendTokens()}
                className="py-5 mt-6 text-finnieBlue-dark bg-finnieGray-100"
                loading={isSending}
                disabled={!!error || !amount || isSending || !destinationWallet}
              />
            )}
          </div>
        </ModalContent>
      </Modal>
    );
  }
);
