import React from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { get } from 'lodash';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { QueryKeys, limitLogsSize } from 'renderer/services';

import { SettingSwitch } from '../../MainSettings/SettingSwitch';

export function LogsWeightLimitSwitch() {
  const queryClient = useQueryClient();
  const { userConfig } = useUserAppConfig({});

  const isLogSizeLimited = get(userConfig, 'limitLogsSize', false);
  const { mutate: mutateLimitLogsSize, isLoading } = useMutation(
    limitLogsSize,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.UserSettings]);
      },
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <SettingSwitch
        id="limit-logs-to-5-mb"
        isLoading={isLoading}
        isChecked={isLogSizeLimited}
        onSwitch={() => mutateLimitLogsSize()}
        labels={['OFF', 'ON']}
      />
    </div>
  );
}
