import { electronStoreService } from 'main/node/helpers/electronStoreService';

export const getIsAccountHidden = (
  _: Event,
  { accountName }: { accountName: string }
): boolean => {
  return electronStoreService.getIsBalancesHiddenByAccount(accountName);
};
