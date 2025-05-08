import fs from 'fs';

import { Keypair } from '@_koii/web3.js';
import { SystemDbKeys } from 'config/systemDbKeys';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';

import { getAppDataPath } from './getAppDataPath';
import { namespaceInstance } from './Namespace';

export function getStakingWalletPath(activeAccount: string): string {
  return `${getAppDataPath()}/namespace/${activeAccount}_stakingWallet.json`;
}
export function getKplStakingWalletPath(activeAccount: string): string {
  return `${getAppDataPath()}/namespace/${activeAccount}_kplStakingWallet.json`;
}

export function getMainSystemWalletPath(activeAccount: string): string {
  return `${getAppDataPath()}/wallets/${activeAccount}_mainSystemWallet.json`;
}

export async function getCurrentActiveAccountName(): Promise<string> {
  const ACTIVE_ACCOUNT = await namespaceInstance.storeGet(
    SystemDbKeys.ActiveAccount
  );
  if (!ACTIVE_ACCOUNT) {
    return throwDetailedError({
      detailed: 'Please select an active account',
      type: ErrorType.NO_ACTIVE_ACCOUNT,
    });
  }
  return ACTIVE_ACCOUNT;
}

async function getWalletPathByType(
  type: 'main' | 'staking' | 'kplStaking',
  accountName?: string
): Promise<string> {
  const activeAccountName =
    accountName ?? (await getCurrentActiveAccountName());
  if (type === 'main') return getMainSystemWalletPath(activeAccountName);
  if (type === 'staking') return getStakingWalletPath(activeAccountName);
  if (type === 'kplStaking') return getKplStakingWalletPath(activeAccountName);
  return throwDetailedError({
    detailed: `Unknown wallet type: ${type}`,
    type: ErrorType.GENERIC,
  });
}

export async function getWalletPathByTypeAndName(
  type: 'main' | 'staking',
  accountName: string
): Promise<string> {
  if (type === 'main') return getMainSystemWalletPath(accountName);
  if (type === 'staking') return getStakingWalletPath(accountName);
  return throwDetailedError({
    detailed: `Unknown wallet type: ${type}`,
    type: ErrorType.GENERIC,
  });
}

export async function getWalletKeyPairByType(
  type: 'main' | 'staking' | 'kplStaking',
  accountName?: string
): Promise<Keypair> {
  const walletPath: string = await getWalletPathByType(type, accountName);
  if (!fs.existsSync(walletPath)) {
    return throwDetailedError({
      detailed: `No wallet found of type: ${type} at location: ${walletPath}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }

  try {
    return Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(fs.readFileSync(walletPath, 'utf-8')) as Uint8Array
      )
    );
  } catch (e: any) {
    return throwDetailedError({
      detailed: `Error during retrieving wallet of type: ${type} from ${walletPath}: ${e}`,
      type: ErrorType.NO_ACCOUNT_KEY,
    });
  }
}

export async function getMainSystemAccountKeypair(): Promise<Keypair> {
  return getWalletKeyPairByType('main');
}

export async function getStakingAccountKeypair(): Promise<Keypair> {
  return getWalletKeyPairByType('staking');
}

export async function getKplStakingAccountKeypair(): Promise<Keypair> {
  return getWalletKeyPairByType('kplStaking');
}

// ACTIVE_ACCOUNT
