import React, { useState, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import CheckmarkIconSvg from 'assets/svgs/checkmark-teal-icon.svg';
import EditIconSvg from 'assets/svgs/edit-icon.svg';
import {
  CRITICAL_MAIN_ACCOUNT_BALANCE,
  CRITICAL_STAKING_ACCOUNT_BALANCE,
} from 'config/node';
import { Button, EditStakeInput } from 'renderer/components/ui';
import {
  useMainAccountBalance,
  useStakingAccountBalance,
} from 'renderer/features/settings';
import { TaskWithStake } from 'renderer/types';
import { getKoiiFromRoe } from 'utils';

interface PropsType {
  task: TaskWithStake;
  updateStake: (taskPublicKey: string, newStake: number) => void;
  setIsRunButtonDisabled: (isDisabled: boolean) => void;
}

export function TaskRow({
  task,
  updateStake,
  setIsRunButtonDisabled,
}: PropsType) {
  const { publicKey, taskName, stake: originalStake, minStake } = task;

  const [stake, setStake] = useState<number>(originalStake);
  const [isEditingStake, setIsEditingStake] = useState<boolean>(false);

  const stakeInKoii = useMemo(() => getKoiiFromRoe(stake), [stake]);

  const { accountBalance: mainAccountBalance = 0 } = useMainAccountBalance();
  const { accountBalance: stakingAccountBalance = 0 } =
    useStakingAccountBalance();

  const meetsMinimumStakeWithMainAccount =
    stake >= minStake &&
    mainAccountBalance >= stake + CRITICAL_MAIN_ACCOUNT_BALANCE;

  const meetsMinimumStakeWithStakingAccount =
    stake >= minStake &&
    stakingAccountBalance >= stake + CRITICAL_STAKING_ACCOUNT_BALANCE;

  const meetsMinimumStake =
    meetsMinimumStakeWithMainAccount || meetsMinimumStakeWithStakingAccount;

  const handleEditInputChange = (newStake: number) => setStake(newStake);

  const stakeButtonClasses = twMerge(
    'rounded-full w-6 h-6 bg-transparent',
    !isEditingStake && 'text-finnieTeal-100'
  );

  const stakeButtonIcon = isEditingStake ? (
    <CheckmarkIconSvg width={38} height={38} />
  ) : (
    <EditIconSvg />
  );

  const disableEditStake = () => {
    if (meetsMinimumStake) {
      updateStake(task.publicKey, stake);
      setIsEditingStake(false);
      setIsRunButtonDisabled(false);
    } else {
      setIsRunButtonDisabled(true);
    }
  };

  const enableEditStake = () => setIsEditingStake(true);

  const handleStakeButtonClick = isEditingStake
    ? disableEditStake
    : enableEditStake;

  return (
    <div
      className="flex flex-row w-full px-12 text-md text-finnieEmerald-light"
      key={publicKey}
    >
      <div className="w-[70%]">
        <div className="flex flex-row items-center gap-2">
          {/* <CodeIconSvg className="mt-0.5" /> */}
          <span>{taskName}</span>
        </div>
      </div>
      <div className="w-[30%]">
        <div className="flex flex-row gap-2">
          <Button
            onClick={handleStakeButtonClick}
            icon={stakeButtonIcon}
            className={stakeButtonClasses}
          />

          {isEditingStake ? (
            <EditStakeInput
              stake={stake}
              meetsMinimumStake={meetsMinimumStake}
              minStake={minStake}
              onChange={handleEditInputChange}
            />
          ) : (
            <div>{stakeInKoii} KOII</div>
          )}
        </div>
      </div>
    </div>
  );
}
