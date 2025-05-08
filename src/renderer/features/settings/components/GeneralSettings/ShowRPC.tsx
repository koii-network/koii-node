import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { get } from 'lodash';
import { QueryKeys } from 'renderer/services';

import { useUserAppConfig } from '../../hooks';
import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function ShowRPC() {
  const queryClient = useQueryClient();
  const { userConfig, userConfigMutation } = useUserAppConfig({});

  const isHideRPCStatusEnabled = get(userConfig, 'hideRPCStatus', true);

  const updateShowRPC = () => {
    return userConfigMutation.mutateAsync({
      settings: {
        hideRPCStatus: !isHideRPCStatusEnabled,
      },
    });
  };

  const { mutate: mutateSwitchShowRPCStatus, isLoading } = useMutation(
    updateShowRPC,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
        console.log(isHideRPCStatusEnabled);
      },
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <SettingSwitch
        id="show-rpc-status"
        isLoading={isLoading}
        isChecked={!isHideRPCStatusEnabled}
        onSwitch={() => mutateSwitchShowRPCStatus()}
        labels={['OFF', 'ON']}
      />
    </div>
  );
}
