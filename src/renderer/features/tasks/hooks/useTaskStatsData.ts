import { useQuery } from 'react-query';

import axios from 'axios';
import { MAINNET_QUERY_PARAM, SERVER_URL } from 'config/server';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import { getNetworkUrl, QueryKeys } from 'renderer/services';
import { getKoiiFromRoe } from 'utils';

const CACHE_TIME = 60 * 60 * 1000;

const getTaskStatsData = async ({
  taskAccountPubKey,
}: {
  taskAccountPubKey: string;
}) => {
  try {
    const queryParams =
      (await getNetworkUrl()) === MAINNET_RPC_URL ? MAINNET_QUERY_PARAM : '';
    const response = await axios.get(
      `${SERVER_URL}/get-task-total-stake/${taskAccountPubKey}${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error('Error while fetching task total stake', error);
    return 0;
  }
};

export function useTaskStatsData(taskAccountPubKey: string) {
  const { data: taskInfo } = useQuery(
    [QueryKeys.TaskStatsData, taskAccountPubKey],
    async () => {
      return getTaskStatsData({ taskAccountPubKey });
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      cacheTime: CACHE_TIME,
      staleTime: CACHE_TIME,
    }
  );

  return {
    lastReward: getKoiiFromRoe(taskInfo?.lastReward || 0),
    topStake: taskInfo?.topStake || 0,
    totalBounty: taskInfo?.totalBountyAmount || 0,
    totalNodes: taskInfo?.totalNodes || 0,
    totalStake: taskInfo?.totalStake || 0,
  };
}
