import { useQuery } from 'react-query';

import { getRPCStatus } from 'renderer/services';

const REFETCH_INTERVAL = 10 * 60 * 1000;

interface Params {
  onSuccess?: () => void;
}

export const useRPCStatus = ({ onSuccess }: Params) => {
  const { data: RPCInfo, refetch: refetchRPC } = useQuery(
    'getRPCStatus',
    getRPCStatus,
    { refetchInterval: REFETCH_INTERVAL, retry: true, onSuccess }
  );

  return {
    RPCInfo,
    refetchRPC,
  };
};
