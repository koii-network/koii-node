import config from 'config';
import {
  FetchMultipleKPLTokenMetadataParams,
  FetchKPLTokenMetadataResponse,
} from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  params: FetchMultipleKPLTokenMetadataParams
): Promise<FetchKPLTokenMetadataResponse[]> =>
  sendMessage(config.endpoints.FETCH_MULTIPLE_KPL_TOKEN_METADATA, params);
