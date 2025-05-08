import {
  CheckSuccessLine,
  CloseLine,
  FlagReportLine,
  Icon,
  ProgressLine,
  WarningTriangleLine,
} from '@_koii/koii-styleguide';
import React from 'react';

import CoolDown from 'assets/svgs/cooldown-line.svg';
import Clock from 'assets/svgs/time-clock.svg';
import WarmUp from 'assets/svgs/warmup-line.svg';
import { TaskStatus } from 'renderer/types';
import { Theme } from 'renderer/types/common';

import { LoadingSpinner } from '../LoadingSpinner';
import { Popover } from '../Popover/Popover';

export const statuses = {
  [TaskStatus.PRE_SUBMISSION]: {
    icon: Clock,
    iconColor: 'text-finnieTeal-100',
    bgColor: 'bg-finnieTeal-100',
    tooltip: 'Your node is making a submission.',
  },
  [TaskStatus.WARMING_UP]: {
    icon: WarmUp,
    iconColor: 'text-finnieOrange',
    bgColor: 'bg-finnieOrange',
    tooltip: 'Warming up: You can start earning rewards faster after 3 rounds.',
  },
  [TaskStatus.ACTIVE]: {
    icon: ProgressLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor: 'bg-finnieEmerald-light',
    tooltip: 'Task in progress.',
  },
  [TaskStatus.COOLING_DOWN]: {
    icon: CoolDown,
    iconColor: 'text-finnieTeal-100',
    bgColor: 'bg-finnieTeal-100',
    tooltip: 'Cooling down: Wait 3 rounds to safely unstake.',
  },
  [TaskStatus.COMPLETE]: {
    icon: CheckSuccessLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor: 'bg-finnieEmerald-light',
    tooltip: 'Task complete.',
  },
  [TaskStatus.STOPPED]: {
    icon: CloseLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor: 'bg-finnieEmerald-light',
    tooltip: 'Stopped.',
  },
  [TaskStatus.ERROR]: {
    icon: WarningTriangleLine,
    iconColor: 'text-[#FFA54B]',
    bgColor: 'bg-[#FFA54B]',
    tooltip: "Something's wrong. Try running this task again.",
  },
  [TaskStatus.BLACKLISTED]: {
    icon: WarningTriangleLine,
    iconColor: 'text-[#FFA54B]',
    bgColor: 'bg-[#FFA54B]',
    tooltip:
      "This task has been delisted, but don't worry! Your tokens are safe and will be ready to unstake after 3 rounds.",
  },
  [TaskStatus.FLAGGED]: {
    icon: FlagReportLine,
    iconColor: 'text-finnieRed',
    bgColor: 'bg-finnieRed',
    tooltip: 'Your node has been flagged as malicious.',
  },
};

export const bonusTaskstatuses = {
  [TaskStatus.PRE_SUBMISSION]: {
    icon: Clock,
    iconColor: 'text-finnieTeal-100',
    bgColor:
      'bg-[linear-gradient(45deg,rgba(251,191,36,0.1)_0%,rgba(201,150,20,0.6)_20%,rgba(201,150,20,1)_80%,rgba(251,191,36,1)_100%)]',
    tooltip: 'Your node is making a submission.',
  },
  [TaskStatus.WARMING_UP]: {
    icon: WarmUp,
    iconColor: 'text-finnieOrange',
    bgColor:
      'bg-[linear-gradient(45deg,rgba(251,191,36,0.1)_0%,rgba(201,150,20,0.6)_20%,rgba(201,150,20,1)_80%,rgba(251,191,36,1)_100%)]',
    tooltip: 'Warming up: You can start earning rewards faster after 3 rounds.',
  },
  [TaskStatus.ACTIVE]: {
    icon: ProgressLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor:
      'bg-[linear-gradient(45deg,rgba(251,191,36,0.1)_0%,rgba(201,150,20,0.6)_20%,rgba(201,150,20,1)_80%,rgba(251,191,36,1)_100%)]',
    tooltip: 'Task in progress.',
  },
  [TaskStatus.COOLING_DOWN]: {
    icon: CoolDown,
    iconColor: 'text-finnieTeal-100',
    bgColor: 'bg-finnieTeal-100',
    tooltip: 'Cooling down: Wait 3 rounds to safely unstake.',
  },
  [TaskStatus.COMPLETE]: {
    icon: CheckSuccessLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor: 'bg-finnieEmerald-light',
    tooltip: 'Task complete.',
  },
  [TaskStatus.STOPPED]: {
    icon: CloseLine,
    iconColor: 'text-finnieEmerald-light',
    bgColor: 'bg-finnieEmerald-light',
    tooltip: 'Stopped.',
  },
  [TaskStatus.ERROR]: {
    icon: WarningTriangleLine,
    iconColor: 'text-[#FFA54B]',
    bgColor: 'bg-[#FFA54B]',
    tooltip: "Something's wrong. Try running this task again.",
  },
  [TaskStatus.BLACKLISTED]: {
    icon: WarningTriangleLine,
    iconColor: 'text-[#FFA54B]',
    bgColor: 'bg-[#FFA54B]',
    tooltip:
      "This task has been delisted, but don't worry! Your tokens are safe and will be ready to unstake after 3 rounds.",
  },
  [TaskStatus.FLAGGED]: {
    icon: FlagReportLine,
    iconColor: 'text-finnieRed',
    bgColor: 'bg-finnieRed',
    tooltip: 'Your node has been flagged as malicious.',
  },
};

type PropsType = {
  status: TaskStatus;
  isLoading?: boolean;
  isRunning?: boolean;
  isPrivate?: boolean;
};

export function Status({
  status,

  isLoading,
  isRunning,
  isPrivate,
}: PropsType) {
  const { icon: StatusIcon, tooltip, iconColor } = statuses[status];

  const tooltipMessage =
    status === TaskStatus.BLACKLISTED && isRunning && !isPrivate
      ? "This task has been delisted, but don't worry! Your tokens are safe. Pause the task and the tokens will be ready to unstake after 3 rounds."
      : tooltip;

  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <Popover tooltipContent={tooltipMessage} theme={Theme.Dark}>
      <Icon source={StatusIcon} className={`h-5 w-5 ${iconColor}`} />
    </Popover>
  );
}
