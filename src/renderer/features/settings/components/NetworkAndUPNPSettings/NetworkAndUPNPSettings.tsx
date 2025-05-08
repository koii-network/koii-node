/* eslint-disable @cspell/spellchecker */
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { useLocalStorage } from 'renderer/features/shared';

import { useUserAppConfig } from '../../hooks';
import { SwitchWrapper } from '../MainSettings/SwitchWrapper';
import { SectionHeader } from '../SectionHeader';
import { Spacer } from '../Spacer';

import { SwitchForceNetworkTunneling } from './SwitchForceNetworkTunneling';
import { ToggleNetworkingFeatures } from './ToggleNetworkingFeatures';
import { UpnpBinaries } from './UpnpBinaries';

export function NetworkAndUPNPSettings() {
  const [showAdvanced, setShowAdvanced] = useLocalStorage<boolean>(
    'show_advanced_networking_settings',
    false
  );
  const { userConfig } = useUserAppConfig({});
  const areNetworkFeaturesEnabled = userConfig?.networkingFeaturesEnabled;
  const tunnelingSwitchClasses = twMerge(
    'w-[280px]',
    !areNetworkFeaturesEnabled && 'bg-gray-600 opacity-50 cursor-not-allowed'
  );

  return (
    <div className="overflow-y-auto text-white">
      <SectionHeader title="Networking Features" />
      <div className="text-sm">
        By turning this on, you allow tasks that require external interactions,
        such as storage operations and hosting APIs, to run on your computer,
        facilitating seamless collaboration and functionality.
      </div>
      <Spacer size="sm" />

      <SwitchWrapper
        title="Enable Networking"
        switchComponent={ToggleNetworkingFeatures}
        className="w-[280px]"
      />
      <Spacer size="lg" />

      <div className="relative items-center inline-block mb-4">
        <input
          id="link-checkbox"
          type="checkbox"
          className="w-3 h-3 terms-checkbox"
          onKeyDown={(e) => e.key === 'Enter' && setShowAdvanced(!showAdvanced)}
          checked={showAdvanced}
          onChange={() => setShowAdvanced(!showAdvanced)}
        />
        <label htmlFor="link-checkbox" className="ml-4 text-sm font-medium ">
          Show Advanced
        </label>
      </div>
      <div className={showAdvanced ? 'block' : 'hidden'}>
        <SectionHeader title="Network Tunneling" />
        <div className="text-sm">
          Enforce Tunneling: Activating this option will ensure that your
          application exclusively utilizes tunneling for communication,
          prioritizing security over other methods. Please note that tunneling
          may require additional computational resources.
        </div>
        <Spacer size="sm" />
        <SwitchWrapper
          title="Enforce Tunneling"
          switchComponent={SwitchForceNetworkTunneling}
          className={tunnelingSwitchClasses}
        />
        <Spacer size="sm" />
        <SectionHeader title="UPnP binaries" />
        <UpnpBinaries />
      </div>
    </div>
  );
}
