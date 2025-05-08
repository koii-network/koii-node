import { useQuery } from 'react-query';

import { QueryKeys, getVersion } from 'renderer/services';

export const useAppVersion = () => {
  const { data, ...query } = useQuery(QueryKeys.AppVersion, getVersion, {
    refetchInterval: Infinity,
  });
  const appVersion =
    process.env.NODE_ENV === 'development'
      ? data?.packageVersion
      : data?.appVersion;

  return { ...query, appVersion };
};
