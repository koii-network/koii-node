import { Event } from 'electron';
import { promises as fsPromises } from 'fs';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';
import { ErrorType, GetTaskMetadataParam, TaskMetadata } from 'models';
import { throwDetailedError } from 'utils';

import { fetchFromIPFSOrArweave } from './fetchFromIPFSOrArweave';

const { readFile, writeFile, access, mkdir } = fsPromises;
const METADATA_CACHE_DIR = `${getAppDataPath()}/metadata`;

export const getTaskMetadata = async (
  _: Event,
  payload: GetTaskMetadataParam
): Promise<TaskMetadata> => {
  // payload validation
  if (!payload?.metadataCID) {
    throw throwDetailedError({
      detailed: 'Get Task Metadata error: payload is not valid',
      type: ErrorType.GENERIC,
    });
  }

  const cacheFilePath = `${METADATA_CACHE_DIR}/${payload.metadataCID}.json`;

  try {
    await mkdir(METADATA_CACHE_DIR, { recursive: true });
    await access(cacheFilePath);

    // If cache exists, read and return its content
    const cachedMetadata = await readFile(cacheFilePath, 'utf-8');
    return JSON.parse(cachedMetadata) as TaskMetadata;
  } catch (cacheError) {
    // Otherwise we fetch it and save it to cache
    try {
      const tooManyRequestsErrorRegex = /<[^>]*>429 Too Many Requests<[^>]*>/g;

      const result = await fetchFromIPFSOrArweave(
        payload.metadataCID,
        'metadata.json'
      );

      if (tooManyRequestsErrorRegex.test(result)) {
        return throwDetailedError({
          detailed: '429 Too Many Requests',
          type: ErrorType.TOO_MANY_REQUESTS,
        });
      }

      const metadata = JSON.parse(result) as TaskMetadata;
      const metadataWasCorrectlyFetched = !!metadata?.description;

      if (!metadataWasCorrectlyFetched) {
        throw new Error('Metadata was not correctly fetched');
      }

      await writeFile(cacheFilePath, JSON.stringify(metadata), 'utf-8');
      return metadata;
    } catch (e: any) {
      console.error(e);
      return throwDetailedError({
        detailed: e,
        type: ErrorType.NO_TASK_METADATA,
      });
    }
  }
};
