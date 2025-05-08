import { Icon, WarningTriangleLine } from '@_koii/koii-styleguide';
import React, { MouseEventHandler, useState } from 'react';
import { useQueryClient } from 'react-query';

import CloseIcon from 'assets/svgs/cross-icon.svg';
import SearchIcon from 'assets/svgs/search.svg';
import UpdateIcon from 'assets/svgs/update-icon.svg';
import {
  CRITICAL_MAIN_ACCOUNT_BALANCE,
  CRITICAL_STAKING_ACCOUNT_BALANCE,
} from 'config/node';
import { KPLBalanceResponse, ROE } from 'models';
import { Button, EditStakeInput, LoadingSpinner } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useFundNewAccountModal } from 'renderer/features/common';
import {
  useMainAccount,
  useMainAccountBalance,
  useStakingAccountBalance,
} from 'renderer/features/settings';
import { useConfirmModal } from 'renderer/features/shared';
import { SettingsButton } from 'renderer/features/tasks/components/AdvancedOptions/AddPrivateTask/SettingsButton';
import { useKplToken } from 'renderer/features/tokens/hooks/useKplToken';
import { QueryKeys } from 'renderer/services';
import { Task } from 'renderer/types';
import { Theme } from 'renderer/types/common';
import { getKoiiFromRoe } from 'utils';

import { TaskUpgradeMutationParams } from '../../context/upgrade-tasks-context';

interface ConfirmUpgradeContentProps {
  onUpgrade: (
    params: Omit<TaskUpgradeMutationParams, 'setUpgradeStatus'>
  ) => void;
  newStake?: ROE;
  minStake: ROE;
  isLoadingNewVersion: boolean;
  hasVariablesToUpgrade: boolean;
  taskVariables: any;
  openSettings: () => void;
  isTaskSettingsValid: boolean;
  isFirstRowInTable: boolean;
  newtaskVersion?: Task;
  taskPublicKey: string;
  tokenType?: string;
  onAcknowledge: () => void;
  onReview: () => void;
  onBackgroundClick?: MouseEventHandler<HTMLButtonElement>;
  oldVersionStake: ROE;
}

export function ConfirmUpgradeContent({
  onUpgrade,
  newStake,
  minStake,
  isLoadingNewVersion,
  hasVariablesToUpgrade,
  taskVariables,
  openSettings,
  isTaskSettingsValid,
  isFirstRowInTable,
  newtaskVersion,
  taskPublicKey,
  tokenType,
  onAcknowledge,
  onReview,
  onBackgroundClick,
  oldVersionStake,
}: ConfirmUpgradeContentProps) {
  const [stake, setStake] = useState(minStake);
  const { data: accountPublicKey } = useMainAccount();
  const { accountBalance = 0 } = useMainAccountBalance();
  const { accountBalance: stakingAccountBalance = 0 } =
    useStakingAccountBalance();
  const { showModal: showLowMainAccountBalanceWarningModal } = useConfirmModal({
    header: 'Low Main Account Balance',
    icon: <Icon source={WarningTriangleLine} className="w-8 h-8" />,
    content: (
      <span className="text-finnieOrange">
        Your main account balance is low. We will use
        <br /> staking account balance to stake on this task. Continue?
      </span>
    ),
  });

  const queryCache = useQueryClient();
  const { kplToken } = useKplToken({ tokenType: tokenType || '' });
  const tokenTicker = kplToken?.symbol || 'KOII';
  const isKplTask = !!tokenType;

  const kplBalanceListQueryData: KPLBalanceResponse[] =
    queryCache.getQueryData([QueryKeys.KplBalanceList, accountPublicKey]) || [];
  const kplBalance =
    kplBalanceListQueryData?.find((balance) => balance.mint === tokenType)
      ?.balance || 0;

  const balanceToUse = Math.max(kplBalance, oldVersionStake);

  const hasEnoughBalanceForStaking = isKplTask
    ? balanceToUse >= stake
    : accountBalance >= stake;
  const hasEnoughKOII = isKplTask
    ? accountBalance >= CRITICAL_MAIN_ACCOUNT_BALANCE
    : accountBalance >= stake + CRITICAL_MAIN_ACCOUNT_BALANCE;

  const hasEnoughKoiiInMainWallet =
    accountBalance >= stake + CRITICAL_MAIN_ACCOUNT_BALANCE;
  const hasEnoughKoiiInStakingWallet =
    stakingAccountBalance >= stake + CRITICAL_STAKING_ACCOUNT_BALANCE;

  const popupStakeWarningModal =
    !isKplTask && !hasEnoughKoiiInMainWallet && hasEnoughKoiiInStakingWallet;

  const isUpgradeButtonDisabled =
    (hasVariablesToUpgrade && !isTaskSettingsValid) ||
    !hasEnoughBalanceForStaking ||
    !hasEnoughKOII;
  const confirmUpgrade = () =>
    onUpgrade({
      taskPublicKey,
      newTaskVersion: newtaskVersion,
      newStake: stake,
      useStakingWalletForStake: !isKplTask && !hasEnoughKoiiInMainWallet,
      tokenType: tokenType || '',
    });
  const { showModal: showFundModal } = useFundNewAccountModal({
    accountPublicKey,
  });

  const minStakeInKoii = getKoiiFromRoe(minStake);

  const getErrorMessage = () => {
    const conditions = [
      {
        condition: hasEnoughBalanceForStaking,
        errorMessage: `have enough ${tokenTicker} to stake`,
        action: isKplTask ? undefined : showFundModal,
      },
      {
        condition: hasEnoughKOII,
        errorMessage: 'have enough KOII for fees',
        action: showFundModal,
      },
      {
        condition: hasEnoughBalanceForStaking,
        errorMessage: `stake at least ${getKoiiFromRoe(
          minStake
        )} ${tokenTicker} on this Task`,
      },
      {
        condition: isTaskSettingsValid,
        errorMessage: 'configure the Task extensions',
        action: openSettings,
      },
    ];

    const errors = conditions
      .filter(({ condition }) => !condition)
      .map(({ errorMessage, action }) => ({ errorMessage, action }));

    if (errors.length === 0) {
      return '';
    } else if (errors.length === 1) {
      return (
        <div>
          Make sure you{' '}
          {errors[0].action ? (
            <button
              onClick={errors[0].action}
              className="font-semibold text-finnieTeal-100 hover:underline"
            >
              {errors[0].errorMessage}.
            </button>
          ) : (
            <>{errors[0].errorMessage}.</>
          )}
        </div>
      );
    } else {
      const errorList = errors.map(({ errorMessage, action }) => (
        <li key={errorMessage}>
          •{' '}
          {action ? (
            <button
              onClick={action}
              className="font-semibold text-finnieTeal-100 hover:underline"
            >
              {errorMessage}
            </button>
          ) : (
            errorMessage
          )}
        </li>
      ));
      return (
        <div>
          Make sure you:
          <br />
          <ul> {errorList}</ul>
        </div>
      );
    }
  };

  const errorMessage = getErrorMessage();

  return isLoadingNewVersion ? (
    <LoadingSpinner />
  ) : (
    <>
      <button
        className="flex col-span-4 justify-around items-center w-full"
        onClick={onBackgroundClick}
        id="upgrade-view"
      >
        <Popover tooltipContent="Review what's new in this update." asChild>
          <Button
            onClick={onReview}
            icon={<SearchIcon />}
            label="Review"
            className="border-2 border-white text-white h-9 w-[115px] bg-transparent rounded-md "
          />
        </Popover>
        <EditStakeInput
          meetsMinimumStake={hasEnoughBalanceForStaking && hasEnoughKOII}
          stake={newStake || stake}
          defaultValue={newStake || stake}
          minStake={minStakeInKoii}
          onChange={(stake) => setStake(stake)}
          disabled={false}
          tokenTicker={tokenTicker}
        />
        <SettingsButton
          isTaskToolsValid={isTaskSettingsValid}
          globalAndTaskVariables={taskVariables}
          onToggleView={openSettings}
          hasInvertedTooltip={isFirstRowInTable}
          isUpgradeView
        />
        <Popover
          theme={Theme.Dark}
          tooltipContent={errorMessage}
          isHidden={!isUpgradeButtonDisabled}
        >
          <Button
            onClick={async () => {
              if (popupStakeWarningModal) {
                const confirm = await showLowMainAccountBalanceWarningModal();

                if (confirm) {
                  confirmUpgrade();
                }
              } else {
                confirmUpgrade();
              }
            }}
            icon={<UpdateIcon className="w-6 h-6 stroke-2" />}
            label="Upgrade"
            className="w-32 bg-white text-black h-9"
            disabled={isUpgradeButtonDisabled}
          />
        </Popover>
      </button>

      <div className="col-span-1">
        <CloseIcon onClick={onAcknowledge} className="cursor-pointer" />
      </div>
    </>
  );
}
