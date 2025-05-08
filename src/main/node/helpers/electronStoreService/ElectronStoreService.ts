import Store from 'electron-store';

import {
  MAINNET_RPC_URL,
  NetworkUrlType,
  TESTNET_RPC_URL,
} from 'renderer/features/shared/constants';

import { StoreSchema } from './types';

export class ElectronStoreService {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>();
    this.initializeStore();
  }

  private async initializeStore() {
    // this.store.set('k2URL', TESTNET_RPC_URL);

    const k2URL = this.store.get('k2URL');

    if (!k2URL || (k2URL !== TESTNET_RPC_URL && k2URL !== MAINNET_RPC_URL)) {
      this.store.set('k2URL', MAINNET_RPC_URL);
    }
  }

  public getK2NetworkUrl(): NetworkUrlType {
    return this.store.get('k2URL') as NetworkUrlType;
  }

  public setK2NetworkUrl(url: string): void {
    this.store.set('k2URL', url);
  }

  public getTimeToNextRewardAsSlots(): number {
    return this.store.get('timeToNextRewardAsSlots');
  }

  public setTimeToNextRewardAsSlots(slots: number): void {
    this.store.set('timeToNextRewardAsSlots', slots);
  }

  public getIsBalancesHiddenByAccount(accountName: string): boolean {
    return this.store.get(`isBalancesHiddenByAccount-${accountName}`);
  }

  public setIsBalancesHiddenByAccount(
    accountName: string,
    isHidden: boolean
  ): void {
    this.store.set(`isBalancesHiddenByAccount-${accountName}`, isHidden);
  }
}

export const electronStoreService = new ElectronStoreService();
