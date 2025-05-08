import React from 'react';
import { useQuery } from 'react-query';

import { Dropdown } from 'renderer/components/ui/Dropdown';
import { useConfirmModal } from 'renderer/features/shared';
import {
  AVAILABLE_NETWORKS,
  NetworkUrlType,
} from 'renderer/features/shared/constants';
import { QueryKeys } from 'renderer/services';
import {
  appRelaunch,
  getNetworkUrl,
  switchNetwork,
} from 'renderer/services/api/utils';

const DROPDOWN_ID = 'network-dropdown';

export function SelectNetworkDropdown() {
  const dropdownRef = React.useRef<HTMLButtonElement>(null);
  const { data: currentNetwork, isLoading } = useQuery(
    [QueryKeys.GetNetworkUrl],
    getNetworkUrl,
    {}
  );
  const { showModal } = useConfirmModal({
    header: 'Change Network?',
    content:
      'By changing the network, you will cause the app to restart, \n\nare you sure?',
  });

  const availableNetowrksArray = Object.values(AVAILABLE_NETWORKS);

  const defaultNetwork = availableNetowrksArray.find(
    (network) => network.url === currentNetwork
  );

  const handleNetworkSelect = async (network: NetworkUrlType) => {
    const confirm = await showModal();
    if (confirm) {
      await switchNetwork(network);
      appRelaunch();
      return true;
    } else {
      return false;
    }
  };

  if (isLoading) {
    return null;
  }

  const defaultValue = defaultNetwork
    ? {
        label: defaultNetwork?.name,
        id: defaultNetwork?.url,
      }
    : null;

  return (
    <Dropdown
      items={availableNetowrksArray.map(({ name, url }) => {
        return {
          label: name,
          id: url,
        };
      })}
      onSelect={(selectedItem) =>
        handleNetworkSelect(selectedItem.id as NetworkUrlType)
      }
      containerClassOverrides="h-fit"
      placeholderText="Select network"
      defaultValue={defaultValue}
      dropdownId={DROPDOWN_ID}
      ref={dropdownRef}
    />
  );
}
