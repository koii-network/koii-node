import { ErrorType, fetchKPLListResponse } from 'models';
import fetch from 'node-fetch';
import { throwDetailedError } from 'utils';

export const fetchKPLList = async (): Promise<fetchKPLListResponse> => {
  const kplListUrl =
    'https://raw.githubusercontent.com/koii-network/KPL-Token-Whitelist/main/metadata.json';
  try {
    const response = await fetch(kplListUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = (await response.json()) as fetchKPLListResponse;
    return jsonData;
  } catch (error) {
    console.error(error);
    return throwDetailedError({
      detailed: error as string,
      type: ErrorType.FETCH_ACCOUNT_BALANCE,
    });
  }
};
