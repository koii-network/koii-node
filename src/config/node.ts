/* eslint-disable @cspell/spellchecker */
import { ErrorType } from 'models';

// import { upnpPath } from './upnpPathResolver';

export const REDIS = {
  IP: 'localhost',
  PORT: 6379,
};

export const BUNDLER_URL = 'https://mainnet.koii.live';

export const RESTORE_KOHAKU = true;

export const SERVER_PORT = 30017;

export const ARWEAVE_GATEWAY_URL = 'https://arweave.net';
export const IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs';

export const TASK_CONTRACT_ID = 'Koiitask22222222222222222222222222222222222';

export const ATTENTION_TASK_ID = 'Attention22222222222222222222222222222222222';

const MINIMUM_ACCEPTED_LENGTH_TASK_CONTRACT = 500;

export const STAKING_DERIVATION_PATH = "m/44'/501'/99'/0'";
export const KPL_STAKING_DERIVATION_PATH = "m/44'/501'/99'/1'";

/** ******************************** uPnP and Dynamic DNS Stuff BEGIN ************************************* */

export const DYNAMIC_DNS_URL = 'https://dynamic.koiidns.com';

/** ******************************** uPnP and Dynamic DNS Stuff END ************************************* */
// value in ROE
const TASK_FEE = 50000000;

export const TASK_STABILITY_THRESHOLD = 18000000; // five hours in ms

export const DUMMY_ACTIVE_TASK_FOR_STAKING_KEY_WITHDRAWAL =
  '9tHF7JcKvsDdYKeFA3eXKMAz4mw3ofaBDrC1ArwYoUJB';
export const STAKE_POT_ACCOUNT_FOR_STAKING_KEY_WITHDRAWAL =
  'stakepotaccounty3joR5z8jhAkQLrpvZZ1wJ4XPfLC';

const K2_CONNECTION_ERROR_MESSAGES = [
  ErrorType.TASK_NOT_FOUND,
  '503 Service Temporarily Unavailable',
  'ENOTFOUND',
  'EADDRNOTAVAIL',
  'ETIMEDOUT',
];

export const MAX_TASK_RETRY_TIME = 5 * 60 * 1000;

export const LOW_MAIN_ACCOUNT_BALANCE = 200000000;
export const CRITICAL_MAIN_ACCOUNT_BALANCE = 100000000;
export const CRITICAL_STAKING_ACCOUNT_BALANCE = 100000000;

export const STAY_AWAKE_POLICY = 'prevent-display-sleep';

export const BONUS_TASK_NAME = 'Bonus Task';
export const BONUS_TASK_DEPLOYER =
  'EaXQQVtg6PDzQ118dCR4pjmepvgrGAGp5mqiqggiXt7u';

export default {
  REDIS,
  BUNDLER_URL,
  RESTORE_KOHAKU,
  SERVER_PORT,
  ARWEAVE_GATEWAY_URL,
  IPFS_GATEWAY_URL,
  TASK_CONTRACT_ID,
  MINIMUM_ACCEPTED_LENGTH_TASK_CONTRACT,
  TASK_FEE,
  STAKING_DERIVATION_PATH,
  TASK_STABILITY_THRESHOLD,
  K2_CONNECTION_ERROR_MESSAGES,
  // UPNP_BINARY_PATH,
  DYNAMIC_DNS_URL,
  ATTENTION_TASK_ID,
};
