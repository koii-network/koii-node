import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import { getKoiiFromRoe, getRoeFromKoii } from 'utils';

interface PropsType {
  stake: number;
  meetsMinimumStake: boolean;
  onChange: (newStake: number) => void;
  disabled?: boolean;
  handleChangeStakeView?: () => void;
}

export function EditStakeInput({
  stake,
  meetsMinimumStake,
  onChange,
  disabled = false,
  handleChangeStakeView,
}: PropsType) {
  const [isPristine, setIsPristine] = useState<boolean>(true);
  const [hasEnteredAValue, setHasEnteredAValue] = useState<boolean>(true);

  const hasError = !meetsMinimumStake && !isPristine;
  const inputClasses = twMerge(
    'w-[92px] rounded-sm text-right text-finnieBlue-dark p-[3px] border-2 border-transparent focus:border-finnieEmerald focus:outline-none',
    hasError && 'border-finnieRed focus:border-finnieRed'
  );
  const stakeInKoii = getKoiiFromRoe(stake);
  const value =
    (hasEnteredAValue || disabled) && stakeInKoii !== 0 ? stakeInKoii : '';

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value: newStakeInKoii },
  }) => {
    const newStakeInRoe = getRoeFromKoii(Number(newStakeInKoii));
    onChange(newStakeInRoe);
    // we display the placeholder until the user enters a new stake
    setHasEnteredAValue(true);
  };

  const handleOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && handleChangeStakeView && !hasError) {
      handleChangeStakeView();
    }
  };

  return (
    <div className="flex flex-col items-center w-fit">
      <div className="flex">
        <input
          onBlur={() => setIsPristine(false)}
          value={value}
          placeholder="0"
          onChange={handleChange}
          onKeyDown={handleOnKeyDown}
          type="number"
          className={inputClasses}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
