import React, { ReactNode } from 'react';
import { useQuery } from 'react-query';

import {
  EXPLORER_ADDRESS_URL,
  EXPLORER_DEVNET_PARAM,
  EXPLORER_MAINNET_PARAM,
  EXPLORER_TESTNET_PARAM,
} from 'config/explorer';
import {
  DEVNET_RPC_URL,
  TESTNET_RPC_URL,
} from 'renderer/features/shared/constants';
import { getNetworkUrl, openBrowserWindow, QueryKeys } from 'renderer/services';

type PropsType = {
  address: string;
  className?: string;
  overrideLabel?: ReactNode;
};

export function Address({ address, className, overrideLabel }: PropsType) {
  const { data: networkUrl } = useQuery(QueryKeys.GetNetworkUrl, getNetworkUrl);

  const explorerNetworkParam =
    networkUrl === DEVNET_RPC_URL
      ? EXPLORER_DEVNET_PARAM
      : networkUrl === TESTNET_RPC_URL
      ? EXPLORER_TESTNET_PARAM
      : EXPLORER_MAINNET_PARAM;
  const inspectAddressInExplorer = () =>
    openBrowserWindow(
      `${EXPLORER_ADDRESS_URL}${address}${explorerNetworkParam}`
    );
  const label = overrideLabel || address;

  return (
    <span
      onClick={inspectAddressInExplorer}
      onKeyDown={inspectAddressInExplorer}
      className={`cursor-pointer hover:underline ${className}`}
      role="button"
      tabIndex={0}
    >
      {label}
    </span>
  );
}
