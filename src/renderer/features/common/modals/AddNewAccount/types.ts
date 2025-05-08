export type KeyType = { system: string; accountName: string };

export type CreateKeyPayload = { keys: KeyType; seedPhrase: string };

export enum Steps {
  ImportKey,
  ImportWithKeyPhrase,
  CreateNewKey,
  KeyCreated,
  ShowSeedPhrase,
  AccountImported,
  ImportNewAccount,
  ImportWithKeyFile,
}
