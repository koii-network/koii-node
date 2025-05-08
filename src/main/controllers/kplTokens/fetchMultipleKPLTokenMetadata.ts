import {
  ErrorType,
  FetchMultipleKPLTokenMetadataParams,
  FetchKPLTokenMetadataResponse,
} from 'models';
import { throwDetailedError } from 'utils';

import { fetchKPLTokenMetadata } from './fetchKPLTokenMetadata';

export const fetchMultipleKPLTokenMetadata = async (
  _: Event,
  { mintAddresses }: FetchMultipleKPLTokenMetadataParams
): Promise<FetchKPLTokenMetadataResponse[]> => {
  try {
    const fetchMetadataPromises = mintAddresses.map((mintAddress) => {
      return fetchKPLTokenMetadata({} as any, { mintAddress });
    });

    const results = await Promise.allSettled(fetchMetadataPromises);
    const successfulResults = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<FetchKPLTokenMetadataResponse> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
    results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )
      .forEach((result, index) => {
        console.error(
          `Mint address ${mintAddresses[index]} failed with error:`,
          result.reason
        );
      });

    return successfulResults;
  } catch (error) {
    console.error(error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.GENERIC,
    });
  }
};
