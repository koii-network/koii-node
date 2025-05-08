import { useQuery } from 'react-query';

import { QueryKeys } from 'renderer/services';

export function useMyTaskSubmissionInfo({
  round,
  taskAccountPubKey,
}: {
  round: number;
  taskAccountPubKey: string;
}) {
  const { data } = useQuery(
    [QueryKeys.TaskSubmissionRoundInfo, taskAccountPubKey, round],
    () =>
      window.main.getMyTaskSubmissionRoundInfo({ round, taskAccountPubKey }),
    { enabled: !!taskAccountPubKey && round !== undefined }
  );

  return { data };
}
