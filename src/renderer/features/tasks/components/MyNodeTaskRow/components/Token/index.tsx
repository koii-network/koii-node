import React from 'react';
import { useQuery } from 'react-query';

import KoiiTokenLogo from 'assets/svgs/koii-token-logo.svg';
import TokenPlaceholder from 'assets/svgs/token_placeholder.png';
import {
  EXPLORER_ADDRESS_URL,
  EXPLORER_DEVNET_PARAM,
  EXPLORER_MAINNET_PARAM,
  EXPLORER_TESTNET_PARAM,
} from 'config/explorer';
import { KPLToken } from 'models';
import { LoadingSpinner } from 'renderer/components';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import {
  DEVNET_RPC_URL,
  TESTNET_RPC_URL,
} from 'renderer/features/shared/constants';
import { getNetworkUrl, openBrowserWindow, QueryKeys } from 'renderer/services';
import { Theme } from 'renderer/types/common';

const OCEAN_BASE_URL = 'https://www.koii.network/ocean/';

export function Token({
  token,
  isLoading,
}: {
  token?: KPLToken;
  isLoading: boolean;
}) {
  const { data: networkUrl } = useQuery(QueryKeys.GetNetworkUrl, getNetworkUrl);

  const explorerNetworkParam =
    networkUrl === DEVNET_RPC_URL
      ? EXPLORER_DEVNET_PARAM
      : networkUrl === TESTNET_RPC_URL
      ? EXPLORER_TESTNET_PARAM
      : EXPLORER_MAINNET_PARAM;

  return (
    <Popover
      tooltipContent={
        token
          ? `Learn more about ${token.symbol}`
          : 'This task will accept stake and issue rewards in KOII'
      }
      theme={Theme.Dark}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : token ? (
        <button
          onClick={() => {
            if (token.symbol === 'Unknown') {
              openBrowserWindow(
                `${EXPLORER_ADDRESS_URL}/${token.address}${explorerNetworkParam}`
              );
            } else {
              openBrowserWindow(`${OCEAN_BASE_URL}${token.symbol}`);
            }
          }}
          className="w-8 !h-8 flex justify-center items-center cursor-pointer"
        >
          <img
            src={token?.logoURI}
            onError={(e) => {
              e.currentTarget.src = TokenPlaceholder;
            }}
            alt={`${token?.symbol || 'KOII'} logo`}
            className="w-8 h-8 rounded-full"
          />
        </button>
      ) : (
        <KoiiTokenLogo className="w-[38px] h-[38px] rounded-full flex justify-center items-center -ml-1 cursor-auto" />
      )}
    </Popover>
  );
}
