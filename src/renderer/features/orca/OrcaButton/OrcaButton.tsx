import React from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import OrcaLogo from 'assets/svgs/Orca-Logo.png';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { Theme } from 'renderer/types/common';
import { AppRoute } from 'renderer/types/routes';

type PropsType = {
  status: 'loading' | 'running' | 'paused' | 'not installed';
  isActive?: boolean;
};

export function OrcaButton({ isActive, status }: PropsType) {
  const classes = twMerge(
    'relative rounded-md bg-purple-4',
    isActive && 'bg-theme-orca-active'
  );

  const tooltipContent =
    status === 'loading'
      ? 'Loading'
      : status === 'running'
      ? 'Orca is running'
      : status === 'not installed'
      ? 'Orca is not installed'
      : 'Orca is idle, will start automatically when running an Orca task';

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(AppRoute.SettingsExtensions);
  };

  return (
    <Popover
      tooltipContent={tooltipContent}
      theme={Theme.Dark}
      className={classes}
    >
      <button
        className="flex items-center justify-center"
        onClick={handleClick}
      >
        <img src={OrcaLogo} alt="Orca logo" width={60} height={60} />
        <StatusIndicator status={status} />
      </button>
    </Popover>
  );
}

OrcaButton.displayName = 'OrcaButton';

function StatusIndicator({
  status,
}: {
  status: 'loading' | 'running' | 'paused' | 'not installed';
}) {
  const classes =
    status === 'loading'
      ? 'absolute w-3 h-3 border-4 border-transparent rounded-full -right-1 -bottom-1 border-t-finnieOrange border-r-finnieOrange animate-spin'
      : status === 'running'
      ? 'absolute w-3 h-3 bg-green-300 border border-green-600 rounded-full -right-1 -bottom-1'
      : 'absolute w-3 h-3 bg-transparent border-2 rounded-full border-gray-400 -right-1 -bottom-1';

  return <span className={classes} />;
}
