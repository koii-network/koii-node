import crypto from 'crypto';

import Store from 'electron-store';

import { getMainAccountPubKey } from 'main/controllers';
import { getRoeFromKoii } from 'utils';

import { getSpecificKPLBalance } from '../controllers/kplTokens/getSpecificKPLBalance';

const ONE_MINUTE = 1 * 60 * 1000;
const VIP_MINT_TOKEN_ADDRESS = '9VUq3SfNDh1bgwamF8tr9aGvuXvNi6ktjx1Edc2da7ey';
const store = new Store();

type VipState = Record<
  string,
  {
    hasVipAccess: boolean;
    theme: 'vip' | 'koii';
    lastFetchTimestamp: number;
  }
>;

class VipService {
  private static instance: VipService;

  private static readonly STORE_KEY =
    Buffer.from('vipState').toString('base64');

  private static readonly SECRET_KEY =
    process.env.VIP_SECRET_KEY || 'MY_SECRET_KEY';

  private store: Store;

  private static readonly VIP_TOKEN_THRESHOLD = getRoeFromKoii(1000); // Minimum amount of tokens needed for VIP status

  private constructor() {
    this.store = store;
  }

  public static getInstance(): VipService {
    if (!VipService.instance) {
      VipService.instance = new VipService();
    }
    return VipService.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  private async checkVipTokenBalance(walletAddress: string): Promise<boolean> {
    try {
      // Get the balance of the specific token
      const tokenData = await getSpecificKPLBalance(
        null as any,
        walletAddress,
        VIP_MINT_TOKEN_ADDRESS
      );

      // If user has the token and balance is at least the threshold, they are VIP
      if (
        tokenData &&
        tokenData.balance &&
        BigInt(tokenData.balance) >= BigInt(VipService.VIP_TOKEN_THRESHOLD)
      ) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking VIP token balance:', error);
      return false;
    }
  }

  public async toggleTheme({
    walletAddress,
    theme,
  }: {
    walletAddress: string;
    theme: 'vip' | 'koii';
  }) {
    const currentState = this.getVipState();
    currentState[walletAddress].theme = theme;
    this.saveVipState(currentState);
  }

  public async checkAndUpdateVipAccess(): // walletAddress: string
  Promise<'no-access' | 'vip-disabled' | 'vip-enabled'> {
    const walletAddress = await getMainAccountPubKey();

    const currentState = this.getVipState();

    const now = Date.now();

    if (
      currentState[walletAddress] &&
      now - currentState[walletAddress].lastFetchTimestamp < ONE_MINUTE
    ) {
      return currentState[walletAddress].hasVipAccess &&
        currentState[walletAddress].theme === 'vip'
        ? 'vip-enabled'
        : currentState[walletAddress].hasVipAccess &&
          currentState[walletAddress].theme === 'koii'
        ? 'vip-disabled'
        : 'no-access';
    }
    // Always check on first check or if enough time has passed
    else {
      const hasVipAccess = await this.checkVipTokenBalance(walletAddress);

      if (!hasVipAccess) {
        return 'no-access';
      }
      // const userConfig = await getUserConfig();
      else if (!currentState[walletAddress]) {
        this.saveVipState({
          ...currentState,
          [walletAddress]: {
            hasVipAccess,
            theme: 'vip',
            lastFetchTimestamp: now,
          },
        });
        return 'vip-enabled';
      } else {
        this.saveVipState({
          ...currentState,
          [walletAddress]: {
            hasVipAccess,
            theme: currentState[walletAddress].theme,
            lastFetchTimestamp: now,
          },
        });
        const accessLevel =
          currentState[walletAddress].theme === 'vip'
            ? 'vip-enabled'
            : 'vip-disabled';
        return accessLevel;
      }
    }
  }

  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(VipService.SECRET_KEY.padEnd(32, '0')),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private static decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');

    const iv = buffer.subarray(0, 16);
    const authTag = buffer.subarray(16, 32);
    const encrypted = buffer.subarray(32);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(VipService.SECRET_KEY.padEnd(32, '0')),
      iv
    );

    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  private static isValidVipState(state: any): state is VipState {
    return state && typeof state === 'object';
  }

  private getVipState(): VipState {
    const encryptedState = this.store.get(VipService.STORE_KEY, null);

    if (!encryptedState) {
      return {};
    }

    try {
      const decrypted = VipService.decrypt(encryptedState as string);
      const state = JSON.parse(decrypted) as VipState;

      // Validate state structure
      if (!VipService.isValidVipState(state)) {
        throw new Error('Invalid state structure');
      }

      return state;
    } catch (error) {
      console.error('Error decrypting VIP state:', error);
      // Clear invalid encrypted state and return empty state
      this.store.delete(VipService.STORE_KEY);
      return {};
    }
  }

  private saveVipState(state: VipState) {
    const serialized = JSON.stringify(state);
    const encrypted = VipService.encrypt(serialized);
    this.store.set(VipService.STORE_KEY, encrypted);
  }
}

export default VipService;
