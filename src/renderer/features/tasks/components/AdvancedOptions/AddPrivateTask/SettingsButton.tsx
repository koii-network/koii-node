import { Icon } from '@_koii/koii-styleguide';
import React, { useCallback, useMemo } from 'react';

import GearFill from 'assets/svgs/gear-fill.svg';
import GearLine from 'assets/svgs/gear-line.svg';
import { RequirementTag } from 'models';
import { Button, Placement, Tooltip } from 'renderer/components/ui';

type PropsType = {
  isTaskToolsValid: boolean;
  globalAndTaskVariables: RequirementTag[];
  onToggleView: (view: 'info' | 'settings') => void;
  hasInvertedTooltip?: boolean;
  isUpgradeView?: boolean;
};

export function SettingsButton({
  globalAndTaskVariables,
  isTaskToolsValid,
  onToggleView,
  hasInvertedTooltip,
  isUpgradeView,
}: PropsType) {
  const handleToggleView = useCallback(
    () => onToggleView('settings'),
    [onToggleView]
  );
  const GearIcon = useMemo(
    () => (globalAndTaskVariables?.length ? GearFill : GearLine),
    [globalAndTaskVariables]
  );

  const gearIconColor = useMemo(
    () =>
      `hover:rotate-180 transition-all duration-300 ease-in-out ${
        isTaskToolsValid ? 'text-finnieEmerald-light' : 'text-[#FFA6A6]'
      }`,
    [isTaskToolsValid]
  );

  const gearTooltipContent = useMemo(
    () =>
      !globalAndTaskVariables?.length
        ? isUpgradeView
          ? 'This upgrade does not require pairing new task extensions'
          : 'This task does not use any task extensions'
        : isTaskToolsValid
        ? 'Open task extensions'
        : 'You need to set up the Task extensions first in order to run this Task.',
    [globalAndTaskVariables, isTaskToolsValid]
  );
  const tooltipPlacement: Placement = `${
    hasInvertedTooltip ? 'bottom' : 'top'
  }-left`;

  return (
    <Tooltip placement={tooltipPlacement} tooltipContent={gearTooltipContent}>
      <div className="flex flex-col items-center justify-start w-10">
        <Button
          onMouseDown={handleToggleView}
          disabled={!globalAndTaskVariables?.length}
          icon={<Icon source={GearIcon} size={36} className={gearIconColor} />}
          onlyIcon
        />
      </div>
    </Tooltip>
  );
}
