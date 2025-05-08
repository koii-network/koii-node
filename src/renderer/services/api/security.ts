export const getEncryptedSecretPhrase = async (pubKey: string) => {
  const encryptedSecretPhrase = await window.main.getEncryptedSecretPhrase(
    pubKey
  );
  return encryptedSecretPhrase;
};

export const saveEncryptedSecretPhrase = (payload: Record<string, string>) => {
  return window.main.saveEncryptedSecretPhraseMap(payload);
};

export const getEncryptedSecretPhraseMap = async () => {
  const encryptedSecretPhrase = await window.main.getEncryptedSecretPhraseMap();
  return encryptedSecretPhrase;
};

export const generateSeedPhrase = (): Promise<string> => {
  return window.main.generateSeedPhrase();
};

export const createNodeWallets = (
  mnemonic: string,
  accountName: string,
  encryptedSecretPhrase: string
) => {
  return window.main.createNodeWallets({
    mnemonic,
    accountName,
    encryptedSecretPhrase,
  });
};

export const createNodeWalletsFromJson = (
  jsonKey: number[],
  accountName: string
) => {
  return window.main.createNodeWalletsFromJson({
    accountName,
    jsonKey,
  });
};

export const setActiveAccount = async (accountName: string) =>
  window.main.setActiveAccount({ accountName });

export const removeAccount = async (accountName: string) => {
  const res = await window.main.removeAccountByName({ accountName });
  return res;
};

export const getRetryDataByTaskId = async (taskPubKey: string) => {
  return window.main.getRetryDataByTaskId({ taskPubKey });
};
