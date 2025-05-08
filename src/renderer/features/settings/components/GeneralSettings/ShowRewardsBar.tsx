import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { get } from 'lodash';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { QueryKeys } from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { useUserAppConfig } from '../../hooks';
import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function ShowRewardsBar() {
  const queryClient = useQueryClient();
  const { userConfig, userConfigMutation } = useUserAppConfig({});

  const isRewardsBarHidden = get(userConfig, 'hideRewardsBar', false);

  const updateHideRewardsBar = () => {
    return userConfigMutation.mutateAsync({
      settings: {
        hideRewardsBar: !isRewardsBarHidden,
      },
    });
  };

  const { mutate: mutateHideRewardsBar, isLoading } = useMutation(
    updateHideRewardsBar,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
      },
    }
  );

  const tooltipContent =
    'The rewards bar provides real-time updates for your tasks but may impact system performance';

  return (
    <Popover tooltipContent={tooltipContent} theme={Theme.Dark}>
      <div className="flex flex-col gap-5">
        <SettingSwitch
          id="show-rewards-bar"
          isLoading={isLoading}
          isChecked={!isRewardsBarHidden}
          onSwitch={() => mutateHideRewardsBar()}
          labels={['OFF', 'ON']}
        />
      </div>
    </Popover>
  );
}
