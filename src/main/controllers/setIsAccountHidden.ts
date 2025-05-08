import { electronStoreService } from 'main/node/helpers/electronStoreService';

export const setIsAccountHidden = (
  _: Event,
  {
    accountName,
    isHidden,
  }: {
    accountName: string;
    isHidden: boolean;
  }
): void => {
  electronStoreService.setIsBalancesHiddenByAccount(accountName, isHidden);
};
