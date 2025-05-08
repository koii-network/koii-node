import React from 'react';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useConfirmModal } from 'renderer/features/shared';
import { appRelaunch } from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { useUserAppConfig } from '../../hooks';
import { SwitchWithLoader } from '../GeneralSettings/AutomaticUpdatesSwitch';

export function SwitchForceNetworkTunneling() {
  const { userConfig, userConfigMutation, isMutating } = useUserAppConfig({
    onConfigSaveSuccess() {
      appRelaunch();
    },
  });

  const { showModal } = useConfirmModal({
    header: 'Toggle Network Tunneling',
    content:
      'By toggling Network Tunneling, you will cause the app to restart, \n\nare you sure?',
  });

  const forceNetworkTinneling = userConfig?.forceTunneling;

  const tooltipContent =
    'Network Tunneling is currently automatically enforced whenever using networking features to ensure secure connections. This enforcement may be temporary.';

  return (
    <div className="flex flex-col gap-5">
      <Popover tooltipContent={tooltipContent} theme={Theme.Dark}>
        <SwitchWithLoader
          id="autoUpdates"
          isChecked
          // isChecked={!!forceNetworkTinneling}
          onSwitch={async () => {
            const confirm = await showModal();

            if (confirm) {
              const forceTunneling = !forceNetworkTinneling;

              userConfigMutation.mutate({
                settings: {
                  forceTunneling,
                },
              });
            }
          }}
          labels={['OFF', 'ON']} // Switched labels to match the new logic
          // disabled={isMutating}
          disabled
        />
      </Popover>
    </div>
  );
}
