import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { get } from 'lodash';
import { QueryKeys, switchLaunchOnRestart } from 'renderer/services';

import { useUserAppConfig } from '../../hooks';
import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function LaunchOnRestart() {
  const queryClient = useQueryClient();
  const { userConfig } = useUserAppConfig({});

  const isLaunchOnRestartEnabled = get(userConfig, 'launchOnRestart', false);
  const { mutate: mutateSwitchLaunchOnRestart, isLoading } = useMutation(
    switchLaunchOnRestart,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
      },
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <SettingSwitch
        id="launch-on-restart"
        isLoading={isLoading}
        isChecked={isLaunchOnRestartEnabled}
        onSwitch={() => mutateSwitchLaunchOnRestart()}
        labels={['OFF', 'ON']}
      />
    </div>
  );
}
