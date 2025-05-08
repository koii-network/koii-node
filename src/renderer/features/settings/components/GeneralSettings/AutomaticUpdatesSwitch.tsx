import React from 'react';

import { LoadingSpinner, Switch } from 'renderer/components/ui';

interface Props {
  id: string;
  isChecked: boolean;
  onSwitch: () => void;
  labels: [string, string];
  disabled?: boolean;
  isLoading?: boolean;
}

export function SwitchWithLoader({
  id,
  isLoading,
  isChecked,
  onSwitch,
  labels,
  disabled,
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
          disabled={disabled}
        />
      )}
      <span>{rightLabel}</span>
    </div>
  );
}
