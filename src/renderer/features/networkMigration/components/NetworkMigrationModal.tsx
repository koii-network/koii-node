/* eslint-disable @cspell/spellchecker */
import { BrowseInternetLine, Button } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { VESTING_PORTAL_URL } from 'config/vestingPortal';
import { LoadingSpinner } from 'renderer/components/ui';
import { useMainAccountBalance, useUserAppConfig } from 'renderer/features';
import { Modal, ModalContent } from 'renderer/features/modals';
import { NetworkUrlType } from 'renderer/features/shared/constants';
import {
  appRelaunch,
  initializeTasks,
  openBrowserWindow,
  QueryKeys,
  startAllTasks,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';

type PropsType = {
  migrationPhase: 1 | 2;
  newNetworkRpcUrl: NetworkUrlType;
};

const isVotingRoundError = (error: any) => {
  try {
    const errorMessage = error?.message?.includes(
      'Error invoking remote method'
    )
      ? error.message.split('Error: ')[1]
      : error.message;

    const errorDetails = JSON.parse(errorMessage);
    return (errorDetails as { type: string }).type === 'ACTIVE_VOTING_ROUND';
  } catch {
    return false;
  }
};

export const NetworkMigrationModal = create<PropsType>(
  function NetworkMigration({ migrationPhase, newNetworkRpcUrl }) {
    const modal = useModal();

    const migrationPhaseToExecute =
      migrationPhase === 1
        ? window.main.startNetworkMigration
        : window.main.finishNetworkMigration;

    const [isSuccess, setIsSuccess] = useState(false);
    const [hasTaskMigrationErrors, setHasTaskMigrationErrors] = useState(false);

    const queryClient = useQueryClient();

    const {
      mutate: startNetworkMigration,
      isLoading,
      isError: isMigrationError,
      error: migrationError,
    } = useMutation(migrationPhaseToExecute, {
      retry: (failureCount, error) => {
        console.log('migration error', error);
        if (isVotingRoundError(error)) {
          return false; // Don't retry for voting round errors
        }
        return failureCount < 4;
      },
      onSuccess: async (data: any) => {
        if (migrationPhase === 2) {
          setHasTaskMigrationErrors(data.hasTaskMigrationErrors);
          await initializeTasks();
          await startAllTasks();
          queryClient.invalidateQueries([QueryKeys.TaskList]);
          setIsSuccess(true);
        }
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
      },
    });

    console.log({ isLoading, isMigrationError });

    const migrationHasAlreadyStarted = useRef(false);

    const {
      accountBalance,
      refetchAccountBalance: originalRefetchAccountBalance,
      loadingAccountBalance,
      isInitialLoading,
    } = useMainAccountBalance();

    const [isRefetchingAccountBalance, setIsRefetching] = useState(false);

    const refetchAccountBalance = useCallback(() => {
      setIsRefetching(true);
      originalRefetchAccountBalance().finally(() => {
        setTimeout(() => {
          setIsRefetching(false);
        }, 1000);
      });
    }, [originalRefetchAccountBalance]);

    const hasBalance = accountBalance && accountBalance > 0;

    const startMigration = useCallback(() => {
      if (migrationHasAlreadyStarted.current) {
        return;
      }
      startNetworkMigration(newNetworkRpcUrl);
      migrationHasAlreadyStarted.current = true;
    }, [newNetworkRpcUrl, startNetworkMigration]);

    useEffect(() => {
      if (migrationPhase === 1 || (migrationPhase === 2 && hasBalance)) {
        startMigration();
      }
    }, [hasBalance, startMigration, migrationPhase]);

    const getLogs = () => window.main.openNodeLogfileFolder();
    const retryMigration = () => startNetworkMigration(newNetworkRpcUrl);

    const { handleSaveUserAppConfig } = useUserAppConfig();

    const skipMigration = useCallback(async () => {
      // For phase 1, require explicit confirmation
      if (migrationPhase === 1) {
        const confirmed = window.confirm(
          "Your testnet task data hasn't been backed up yet. If you skip the migration now, you'll need to set up your tasks manually on mainnet. Would you like to continue?"
        );
        if (!confirmed) return;
      }

      // For phase 2 without balance, require explicit confirmation
      if (migrationPhase === 2 && !hasBalance) {
        const confirmed = window.confirm(
          "If you proceed without having KOII tokens, we won't be able to start your tasks on mainnet. Would you like to continue?"
        );
        if (!confirmed) return;
      }

      // Only proceed if user confirmed or if it's phase 2 with balance
      handleSaveUserAppConfig({
        settings: {
          hasStartedTheMainnetMigration: true,
          hasFinishedTheMainnetMigration: true,
        },
      });
      await appRelaunch();
    }, [handleSaveUserAppConfig, migrationPhase, hasBalance]);

    const noBalanceContent = (
      <div className="flex flex-col gap-5">
        {isInitialLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner className="w-5 h-5" />
            <span>Loading balance...</span>
          </div>
        ) : (
          <>
            <p>
              To proceed with the network upgrade and start your tasks,
              you&apos;ll need to have KOII tokens in your wallet.
            </p>
            <p>
              If you&apos;re expecting tokens from vesting, they will be
              automatically distributed to your wallet when they unlock. Please
              check back once you have tokens, or skip the migration now and
              start your tasks manually later.
            </p>
            <div className="bg-finnieBlue-darker/30 p-4 rounded-lg mx-auto">
              <p className="text-sm text-finnieGray-tertiary mb-2">
                Current Balance
              </p>
              <p className="text-xl font-medium">
                {accountBalance?.toFixed(2) || '0'} KOII
              </p>
            </div>
            <div className="flex gap-5 mx-auto my-4 justify-evenly w-full">
              <Button
                label="Go to the Vesting Portal"
                onClick={() => openBrowserWindow(VESTING_PORTAL_URL)}
                className="w-56 h-12 m-auto font-semibold bg-finnieBlue-light text-white"
              />
              {isRefetchingAccountBalance ? (
                <div className="flex items-center justify-center gap-2 w-56 h-12">
                  <LoadingSpinner className="w-5 h-5" />
                  <span>Checking Balance...</span>
                </div>
              ) : (
                <Button
                  label="Refresh Balance"
                  onClick={() => refetchAccountBalance()}
                  className="w-56 h-12 m-auto font-semibold border border-white text-white disabled:opacity-50"
                />
              )}
              <Button
                label="Skip Migration"
                onClick={skipMigration}
                className="w-56 h-12 mx-auto font-semibold bg-red-500 text-white"
              />
            </div>
          </>
        )}
      </div>
    );

    const title = isMigrationError
      ? "Whoops! Something's not quite right..."
      : 'Mainnet Migration';

    const getErrorMessage = useCallback((error: any) => {
      try {
        const errorMessage = error?.message?.includes(
          'Error invoking remote method'
        )
          ? error.message.split('Error: ')[1]
          : error.message;

        const stringifiedMessage = JSON.stringify(error.message);
        if (stringifiedMessage.includes('insufficient funds')) {
          return "It looks like you don't have enough funds on mainnet to start your tasks. You can skip the migration now and start your tasks manually later.";
        }
        const errorDetails = JSON.parse(errorMessage);
        if ((errorDetails as { type: string }).type === 'ACTIVE_VOTING_ROUND') {
          return 'We attempted to migrate your node to mainnet but some of your tasks are still in active voting rounds and cannot be unstaked. Please wait a couple of rounds for them to complete their cool-off period before trying again. This could take a few hours.';
        }
        if (
          (errorDetails as { detailed: string })?.detailed?.includes(
            'insufficient funds'
          )
        ) {
          return "It looks like you don't have enough funds on mainnet to start your tasks. You can skip the migration now and start your tasks manually later.";
        }
        return 'An error occurred while migrating your node to mainnet. Please try again later.';
      } catch {
        if (migrationPhase === 2) {
          return (
            <>
              <p className="mb-3">
                There was an error in the final step of the mainnet migration,
                but we&apos;ve recorded the data from your testnet tasks.
              </p>
              <p className="mb-3">
                You can safely skip the migration now if needed - you&apos;ll
                just need to start your tasks manually on mainnet if you skip
                now.
              </p>
            </>
          );
        } else {
          return 'An error occurred while migrating your node to mainnet. Please try again later.';
        }
      }
    }, []);

    const text = isMigrationError
      ? getErrorMessage(migrationError)
      : migrationPhase === 1
      ? 'We are migrating your node from testnet to mainnet. Your node will restart shortly after we safely record your task data.'
      : "We're completing your migration to mainnet. Your tasks will be available to restart in just a few moments.";

    const successContent = (
      <div className="flex flex-col gap-5 text-center">
        <p className="text-xl mb-2">Migration Complete! 🎉</p>
        <p>Your node has been successfully migrated to mainnet.</p>
        {hasTaskMigrationErrors ? (
          <p>
            Some of your tasks don&apos;t have a mainnet version yet, so we
            couldn&apos;t start them automatically. Don&apos;t worry though -
            you can start any new task you&apos;d like from the Add Task table!
          </p>
        ) : (
          <p>Your tasks will resume automatically in a few moments.</p>
        )}
        <Button
          label="Close"
          onClick={() => modal.remove()}
          className="w-36 h-12 mx-auto mt-4 font-semibold bg-finnieBlue-light text-white"
        />
      </div>
    );

    const content = isSuccess ? (
      successContent
    ) : isMigrationError ? (
      <div className="flex flex-col gap-4 text-center">
        <p>{text}</p>
        {isVotingRoundError(migrationError) && (
          <p>
            Quit the app and try again in a few hours when the voting rounds are
            complete.
          </p>
        )}
      </div>
    ) : migrationPhase === 2 && !hasBalance ? (
      noBalanceContent
    ) : (
      <p className="text-center">{text}</p>
    );

    const bottomElement = isSuccess ? null : isMigrationError ? (
      <div className="flex gap-3 mx-auto my-4">
        <Button
          label="Get Logs"
          onClick={getLogs}
          className="w-36 h-12 m-auto font-semibold text-white border border-white"
        />
        {!isVotingRoundError(migrationError) && (
          <>
            <Button
              label="Try again"
              onClick={retryMigration}
              className="w-36 h-12 m-auto font-semibold bg-finnieGray-tertiary text-finnieBlue-light"
            />
            <Button
              label="Skip Migration"
              onClick={skipMigration}
              className="w-36 h-12 m-auto font-semibold bg-red-500 text-white"
            />
          </>
        )}
      </div>
    ) : (
      <LoadingSpinner className="w-10 h-10 mx-auto mt-4" />
    );

    return (
      <Modal>
        <ModalContent
          theme={Theme.Dark}
          className="w-[800px] text-white pt-8 pb-5 px-8 flex flex-col gap-5 text-center font-light"
        >
          <div className="flex gap-5 justify-center">
            <BrowseInternetLine className="w-8 h-8" />
            <p className="text-2xl">{title}</p>
          </div>
          {content}
          {!!hasBalance && bottomElement}
        </ModalContent>
      </Modal>
    );
  }
);
