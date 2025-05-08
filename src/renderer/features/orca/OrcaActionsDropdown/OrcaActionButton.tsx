import { Icon } from '@_koii/koii-styleguide';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import PauseIcon from 'assets/svgs/pause-circle.svg';
import PlayIcon from 'assets/svgs/play-circle.svg';
import { Button, LoadingCircle } from 'renderer/components/ui';

type PropsType = {
  anyOrcaTaskRunning: boolean;
  startOrcaTasks: () => void;
  stopOrcaTasks: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function OrcaActionButton({
  anyOrcaTaskRunning,
  startOrcaTasks,
  stopOrcaTasks,
  disabled,
  isLoading,
}: PropsType) {
  const classes = twMerge(
    'flex items-center gap-2 text-white uppercase',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  return (
    <span className={classes}>
      {anyOrcaTaskRunning ? (
        <>
          {!isLoading ? (
            <Button
              onlyIcon
              onClick={async (e) => {
                e.stopPropagation();
                stopOrcaTasks();
              }}
              icon={<Icon source={PauseIcon} />}
            />
          ) : (
            <LoadingCircle />
          )}
          <span>Pause my ORCA tasks</span>
        </>
      ) : (
        <>
          {!isLoading ? (
            <Button
              onlyIcon
              onClick={async (e) => {
                e.stopPropagation();
                startOrcaTasks();
              }}
              icon={<Icon source={PlayIcon} />}
            />
          ) : (
            <LoadingCircle />
          )}
          <span>Start my ORCA tasks</span>
        </>
      )}
    </span>
  );
}
