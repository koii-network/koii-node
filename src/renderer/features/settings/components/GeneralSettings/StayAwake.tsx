import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { isNumber } from 'lodash';
import {
  QueryKeys,
  enableStayAwake,
  disableStayAwake,
} from 'renderer/services';

import { useUserAppConfig } from '../../hooks/useUserAppConfig';
import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function StayAwake() {
  const queryClient = useQueryClient();
  const { userConfig } = useUserAppConfig({});

  const isStayAwakeEnabled = isNumber(userConfig?.stayAwake);
  const toggleStayAwake = isStayAwakeEnabled
    ? disableStayAwake
    : enableStayAwake;

  const { mutate: switchStayAwake, isLoading } = useMutation(toggleStayAwake, {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.UserSettings]);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <SettingSwitch
        id="stay-awake"
        isLoading={isLoading}
        isChecked={isStayAwakeEnabled}
        onSwitch={() => switchStayAwake()}
        labels={['OFF', 'ON']}
      />
    </div>
  );
}
