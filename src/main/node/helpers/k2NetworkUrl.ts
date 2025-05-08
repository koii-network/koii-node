import { NetworkUrlType } from 'renderer/features/shared/constants';

import { electronStoreService } from './electronStoreService';

export const getK2NetworkUrl = (): string => {
  return electronStoreService.getK2NetworkUrl();
};

export const setK2NetworkUrl = (url: NetworkUrlType): void => {
  return electronStoreService.setK2NetworkUrl(url);
};
