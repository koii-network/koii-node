import {
  ErrorType,
  FetchKPLTokenMetadataParams,
  FetchKPLTokenMetadataResponse,
} from 'models';
import fetch from 'node-fetch';
import { throwDetailedError } from 'utils';

export const fetchKPLTokenMetadata = async (
  _: Event,
  { mintAddress }: FetchKPLTokenMetadataParams
): Promise<FetchKPLTokenMetadataResponse> => {
  const kplMetadataUrl = `https://kpl-api.koii.network/api/metadata/retrieveOne?splTokenAddress=${mintAddress}`;
  try {
    const response = await fetch(kplMetadataUrl);
    if (!response.ok) {
      // Return fallback data if metadata is not found
      return {
        chainId: 0,
        address: mintAddress,
        decimals: 0,
        name: 'Unknown',
        symbol: 'Unknown',
        description: 'Unknown',
        logoURI: 'Unknown',
        tags: [],
      };
    }
    const jsonData = (await response.json()) as FetchKPLTokenMetadataResponse;
    return jsonData;
  } catch (error) {
    console.error(error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.GENERIC,
    });
  }
};
