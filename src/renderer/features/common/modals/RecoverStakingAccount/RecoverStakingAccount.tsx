import { CloseLine, CurrencyMoneyLine, Icon } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { Button, LoadingSpinner } from 'renderer/components/ui';
import { Modal, ModalContent } from 'renderer/features/modals';
import { useStakingAccount } from 'renderer/features/settings/hooks/useStakingAccount';
import { getKPLStakingAccountPubKey, QueryKeys } from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { RetryRecover } from './RetryRecover';

export interface PropsType {
  isKPLStakingAccount: boolean;
}

export const RecoverStakingAccount = create<PropsType>(
  function RecoverStakingAccount({ isKPLStakingAccount }) {
    const modal = useModal();

    const queryCache = useQueryClient();
    const { data: activeStakingPublicKey } = useStakingAccount();
    const { data: activeKPLStakingPublicKey } = useQuery(
      QueryKeys.KPLStakingAccount,
      getKPLStakingAccountPubKey,
      {
        retry: false,
        enabled: isKPLStakingAccount,
      }
    );

    const stakingKeyToRecover = isKPLStakingAccount
      ? activeKPLStakingPublicKey
      : activeStakingPublicKey;

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const recoverAccount = isKPLStakingAccount
      ? window.main.recoverKPLStakingAccount
      : window.main.recoverStakingAccount;

    const execute = useCallback(async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        await recoverAccount();
      } catch (e) {
        console.error(e);
        setIsError(true);
      }
      setIsLoading(false);
      await queryCache.invalidateQueries([
        'stakingKeyIsMessedUp',
        stakingKeyToRecover,
        false,
      ]);
    }, [recoverAccount, stakingKeyToRecover, queryCache]);

    const isAlreadyRecovering = useRef(false);

    useEffect(() => {
      if (isAlreadyRecovering.current) return;
      isAlreadyRecovering.current = true;
      execute();
    }, [execute]);

    console.log({ isLoading });

    return (
      <Modal>
        <ModalContent
          theme={Theme.Dark}
          className="justify-center items-center p-5 pl-10 w-max  gap-5 h-fit rounded text-white flex flex-col min-w-[582px]"
        >
          <div className="flex items-center justify-center w-full gap-4 text-2xl font-semibold">
            <Icon source={CurrencyMoneyLine} className="w-8 h-8" />
            <span>
              {isLoading ? 'Recovering' : 'Recover'}{' '}
              {isKPLStakingAccount ? 'KPL' : ''} Staking Account
            </span>
            <Icon
              source={CloseLine}
              className="w-8 h-8 ml-auto cursor-pointer"
              onClick={modal.remove}
            />
          </div>

          {isError && !isLoading ? (
            <RetryRecover handleRetry={execute} />
          ) : isLoading ? (
            <LoadingSpinner className="w-10 h-10 mx-auto my-20" />
          ) : (
            <>
              <div>
                You&apos;ve successfully recovered your staking account!
              </div>
              <div>
                You can continue running {isKPLStakingAccount ? 'KPL' : ''}{' '}
                tasks and earning rewards.
              </div>
              <Button
                label="Close"
                onClick={modal.remove}
                className="w-56 h-12 m-auto font-semibold rounded-md bg-finnieGray-tertiary text-finnieBlue-light"
              />
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
);
