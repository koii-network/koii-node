import axios from 'axios';
import config from 'config';
import { MAINNET_QUERY_PARAM, SERVER_URL } from 'config/server';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import { StatusResponse } from 'renderer/types';

import { getNetworkUrl } from './api';

const { FAUCET_API_URL } = config.faucet;

export const getFaucetStatus = async (walletAddress: string) => {
  if (walletAddress) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: { referral, ...faucetStatus },
    } = await axios.get<StatusResponse>(
      `${FAUCET_API_URL}/get-user-faucet-state/${walletAddress}`
    );
    return faucetStatus;
  }
};

type TriggerRedemptionResponseType = {
  message: string;
};

type TriggerRedemptionParams = {
  stakingWallet: string;
  mainWallet: string;
};

export async function triggerRedemption({
  stakingWallet,
  mainWallet,
}: TriggerRedemptionParams) {
  const queryParams =
    (await getNetworkUrl()) === MAINNET_RPC_URL ? MAINNET_QUERY_PARAM : '';
  const { data } = await axios.post<TriggerRedemptionResponseType>(
    `${SERVER_URL}/triggerRedemption${queryParams}`,

    {
      stakingWallet,
      mainWallet,
    }
  );
  return data;
}

export async function getOnboardingTaskIds() {
  const brandingConfig = await window.main.getBrandingConfig();
  const onboardingTaskID = brandingConfig?.onboardingTaskID;

  if (onboardingTaskID) {
    return [onboardingTaskID];
  }

  const { data } = await axios.get<{ taskID: string }>(
    `${SERVER_URL}/get-onboarding-task-id`
  );
  return data?.taskID ? [data.taskID] : [];
}
