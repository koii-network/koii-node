import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useTheme } from 'renderer/theme/ThemeContext';

import { SwitchWrapper } from '../MainSettings/SwitchWrapper';
import { SectionHeader } from '../SectionHeader';
import { Spacer } from '../Spacer';

import { AutoUpdates } from './AutoUpdates';
import { ForceNodeUpdate } from './ForceNodeUpdate';
import { LaunchOnRestart } from './LaunchOnRestart';
import { Network } from './Network';
import { NodeLogsSettingsSection } from './NodeLogs/NodeLogsSettingsSection';
import { RecoverTokens } from './RecoverTokens';
import { ResetNodeCache } from './ResetNodeCache';
import { ShowRewardsBar } from './ShowRewardsBar';
import { ShowRPC } from './ShowRPC';
import { StayAwake } from './StayAwake';
import { ThemeToggle } from './ThemeToggle';

export function GeneralSettings() {
  const location = useLocation();
  const [shouldHighlight, setShouldHighlight] = useState(false);

  useEffect(() => {
    if (location.state?.highlightRewardsBar) {
      setShouldHighlight(true);
      const timeout = setTimeout(() => {
        setShouldHighlight(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [location.state]);

  const { vipAccessLevel } = useTheme();

  return (
    <div className="overflow-y-auto text-white">
      <SectionHeader title="General Settings" />
      <div className="flex flex-wrap gap-4">
        <SwitchWrapper
          title="Select Network"
          switchComponent={Network}
          className="w-[280px]"
        />
        <SwitchWrapper
          title="Automatic Updates"
          switchComponent={AutoUpdates}
          className="w-[280px]"
        />
        <SwitchWrapper
          title="Stay Awake"
          switchComponent={StayAwake}
          className="w-[280px]"
        />
        <SwitchWrapper
          title="Launch on Restart"
          switchComponent={LaunchOnRestart}
          className="w-[280px]"
        />
        <SwitchWrapper
          title="Show RPC Status"
          switchComponent={ShowRPC}
          className="w-[280px]"
        />
        <SwitchWrapper
          title="Show Rewards Bar"
          switchComponent={ShowRewardsBar}
          className="w-[280px]"
          highlight={shouldHighlight}
        />
        {vipAccessLevel !== 'no-access' && (
          <SwitchWrapper
            title="Theme"
            switchComponent={ThemeToggle}
            className="w-[280px]"
          />
        )}
      </div>
      <Spacer showSeparator />
      <NodeLogsSettingsSection />
      <Spacer showSeparator />
      <RecoverTokens />
      <Spacer showSeparator />
      <div className="flex justify-between w-full">
        {/* <ForceRedeemMigrationTokens /> */}
        <ResetNodeCache />
        <ForceNodeUpdate />
      </div>
    </div>
  );
}
