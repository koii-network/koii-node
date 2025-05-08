import { Event } from 'electron';

import { setK2NetworkUrl } from 'main/node/helpers/k2NetworkUrl';
import { NetworkUrlType } from 'renderer/features/shared/constants';

export const switchNetwork = async (
  _: Event,
  newNetworkRPCUrl: NetworkUrlType
) => {
  return setK2NetworkUrl(newNetworkRPCUrl);
};
