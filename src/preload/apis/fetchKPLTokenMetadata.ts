import config from 'config';
import {
  FetchKPLTokenMetadataParams,
  FetchKPLTokenMetadataResponse,
} from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  params: FetchKPLTokenMetadataParams
): Promise<FetchKPLTokenMetadataResponse> =>
  sendMessage(config.endpoints.FETCH_KPL_TOKEN_METADATA, params);
