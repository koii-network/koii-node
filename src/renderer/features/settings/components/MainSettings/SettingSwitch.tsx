import React, { ChangeEvent } from 'react';

import { LoadingSpinner, Switch } from 'renderer/components/ui';

interface Props {
  id: string;
  isLoading: boolean;
  isChecked: boolean;
  onSwitch: (e?: ChangeEvent<HTMLInputElement>) => void;
  labels: [string, string];
  isDisabled?: boolean;
}

export function SettingSwitch({
  id,
  isLoading,
  isChecked,
  onSwitch,
  labels,
  isDisabled = false,
}: Props) {
  const [leftLabel, rightLabel] = labels;

  return (
    <div className="flex items-center gap-4">
      <span>{leftLabel}</span>
      {isLoading ? (
        <LoadingSpinner className="mx-2.5" />
      ) : (
        <Switch
          id={id}
          isChecked={isChecked}
          onSwitch={onSwitch}
          disabled={isDisabled}
        />
      )}
      <span>{rightLabel}</span>
    </div>
  );
}
