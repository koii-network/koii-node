import React from 'react';
import { useMutation } from 'react-query';

import { useConfirmModal } from 'renderer/features/shared';
import { appRelaunch } from 'renderer/services';

import { useUserAppConfig } from '../../hooks/useUserAppConfig';
import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function ToggleNetworkingFeatures() {
  const { userConfig, handleSaveUserAppConfigAsync } = useUserAppConfig({});

  const areNetworkFeaturesEnabled = userConfig?.networkingFeaturesEnabled;

  const { showModal } = useConfirmModal({
    header: 'Toggle Networking Features',
    content:
      'By toggling Networking Features, you will cause the app to restart, \n\nare you sure?',
  });

  const { mutate: toggleNetworkFeatures, isLoading } = useMutation(
    () =>
      handleSaveUserAppConfigAsync({
        settings: { networkingFeaturesEnabled: !areNetworkFeaturesEnabled },
      }),
    {
      onSuccess: () => {
        appRelaunch();
      },
    }
  );

  // const tooltipContent = 'This feature is temporarily unavailable';

  return (
    <div className="flex flex-col gap-5">
      {/* <Popover tooltipContent={tooltipContent} theme={Theme.Dark}> */}
      <SettingSwitch
        id="toggle-networking"
        isLoading={isLoading}
        isChecked={!!areNetworkFeaturesEnabled}
        onSwitch={async () => {
          const confirm = await showModal();
          if (confirm) {
            toggleNetworkFeatures();
          }
        }}
        labels={['OFF', 'ON']}
        // isDisabled
      />
      {/* </Popover> */}
    </div>
  );
}
