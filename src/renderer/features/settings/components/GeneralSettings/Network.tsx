import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { Popover } from 'renderer/components/ui/Popover/Popover';
import { useConfirmNetworkSwitchModal } from 'renderer/features/common/hooks';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import {
  QueryKeys,
  appRelaunch,
  getNetworkUrl,
  switchNetwork,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { SettingSwitch } from '../MainSettings/SettingSwitch';

export function Network() {
  const [hasFlippedSwitch, setHasFlippedSwitch] = useState(false);
  const queryClient = useQueryClient();

  const { data: networkUrl, isLoading: isLoadingNetworkUrl } = useQuery(
    QueryKeys.GetNetworkUrl,
    getNetworkUrl
  );

  const toggleNetwork = () => {
    if (isMainnet) {
      return;
    }
    setHasFlippedSwitch((switchState) => !switchState);
    showModal();
  };

  const confirmSwitchNetwork = async () => {
    await switchNetwork(MAINNET_RPC_URL);
    setHasFlippedSwitch((switchState) => !switchState);
    queryClient.invalidateQueries(QueryKeys.GetNetworkUrl);
    await appRelaunch();
  };

  const isMainnet = networkUrl === MAINNET_RPC_URL;

  const { showModal } = useConfirmNetworkSwitchModal({
    onConfirm: confirmSwitchNetwork,
    onCancel: () => setHasFlippedSwitch(false),
    newNetwork: isMainnet ? 'Testnet' : 'Mainnet',
  });

  const isNetworkChecked = hasFlippedSwitch ? !isMainnet : isMainnet;
  const tooltipContent =
    'Switching between different environments is coming soon. Stay tuned! 🚀';
  return (
    <Popover
      tooltipContent={tooltipContent}
      theme={Theme.Dark}
      isHidden={!isMainnet}
    >
      <div className="flex flex-col gap-5">
        <SettingSwitch
          id="network"
          isLoading={isLoadingNetworkUrl}
          isChecked={isNetworkChecked}
          onSwitch={toggleNetwork}
          labels={['TESTNET', 'MAINNET']}
          isDisabled={isMainnet}
        />
      </div>
    </Popover>
  );
}
