import { AccountType } from 'renderer/features/settings/types';

export const fetchKPLList = async () => {
  return window.main.fetchKPLList();
};

export const fetchKPLTokenMetadata = async (mintAddress: string) => {
  return window.main.fetchKPLTokenMetadata({ mintAddress });
};

export const fetchMultipleKPLTokenMetadata = async (
  mintAddresses: string[]
) => {
  if (mintAddresses?.length === 0) {
    return [];
  }
  return window.main.fetchMultipleKPLTokenMetadata({ mintAddresses });
};

export const getKPLBalance = async (address: string) => {
  return window.main.getKPLBalance(address);
};

type TransferKplTokenParams = {
  accountName: string;
  toWallet: string;
  tokenMintAddress: string;
  amount: number;
  accountType: AccountType;
};

export const transferKplToken = async ({
  accountName,
  tokenMintAddress,
  amount,
  toWallet,
  accountType,
}: TransferKplTokenParams) => {
  return window.main.transferKplToken({
    accountName,
    tokenMintAddress,
    amount,
    toWallet,
    accountType,
  });
};
