import { useAtom } from 'jotai';
import { useQuery, UseQueryOptions } from 'react-query';

import { TaskMetadata } from 'models';
import { getTaskMetadata, QueryKeys } from 'renderer/services';

import { tasksMetadataByIdAtom } from '../state';

type CIDType = string | undefined | null;

const fetchMetadata = async (metadataCID: CIDType) => {
  if (!metadataCID) {
    return null;
  }

  const results = await getTaskMetadata(metadataCID);

  return results;
};

export const useMetadata = ({
  metadataCID,
  queryOptions,
  taskPublicKey,
}: {
  metadataCID: CIDType;
  taskPublicKey: string;
  queryOptions?: Omit<
    UseQueryOptions<
      TaskMetadata | null,
      unknown,
      TaskMetadata | null,
      string[]
    >,
    'queryKey' | 'queryFn'
  >;
}) => {
  const [, setData] = useAtom(tasksMetadataByIdAtom);

  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useQuery(
    [QueryKeys.TaskMetadata, taskPublicKey],
    () => fetchMetadata(metadataCID),
    {
      staleTime: Infinity,
      retry: 10,
      ...queryOptions,
      onSuccess(data) {
        if (data) {
          setData((prev) => ({ ...prev, [metadataCID || '']: data }));
        }
      },
    }
  );

  return { metadata, isLoadingMetadata, metadataError };
};
