import React from 'react';

import { useUserAppConfig } from '../../hooks';

import { SwitchWithLoader } from './AutomaticUpdatesSwitch';

export function AutoUpdates() {
  const { userConfig, userConfigMutation, isMutating } = useUserAppConfig({});

  const autoUpdatesDisabled = userConfig?.autoUpdatesDisabled;

  return (
    <div className="flex flex-col gap-5">
      <SwitchWithLoader
        id="autoUpdates"
        isChecked={!autoUpdatesDisabled} // If autoUpdatesDisabled is not set or is false, isChecked will be true (updates enabled)
        onSwitch={() => {
          const newAutoUpdatesDisabled = !autoUpdatesDisabled;

          userConfigMutation.mutate({
            settings: {
              autoUpdatesDisabled: newAutoUpdatesDisabled,
            },
          });
        }}
        labels={['OFF', 'ON']} // Switched labels to match the new logic
        disabled={isMutating}
      />
    </div>
  );
}
