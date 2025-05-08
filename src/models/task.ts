import { PublicKey } from '@_koii/web3.js';

interface AuditTriggerState {
  trigger_by: PublicKey;
  slot: number;
  votes: Array<{ is_valid: boolean; voter: PublicKey; slot: number }>;
}
export type Round = string;
export type PublicKeyString = string;
export type StakingKeyString = string;

export type Submission = {
  submission_value: string;
  slot: number;
};

export type SubmissionsPerRound = Record<
  Round,
  Record<PublicKeyString, Submission>
>;

export type AvailableBalances = Record<string, number>;
export type StakeList = Record<StakingKeyString, number>;

export type TaskType = 'KOII' | 'KPL';

export interface RawTaskData {
  task_id: string;
  is_running?: boolean;

  task_name: string;
  task_manager: PublicKey;
  is_allowlisted: boolean;
  is_active: boolean;
  task_audit_program: string;
  stake_pot_account: PublicKey;
  total_bounty_amount: number;
  bounty_amount_per_round: number;
  current_round: number;
  available_balances: AvailableBalances;
  stake_list: StakeList;
  task_metadata: string;

  task_description: string;
  submissions: SubmissionsPerRound;
  submissions_audit_trigger: Record<string, Record<string, AuditTriggerState>>;
  total_stake_amount: number;
  minimum_stake_amount: number;
  ip_address_list: Record<string, string>;
  round_time: number;
  starting_slot: number;
  audit_window: number;
  submission_window: number;
  task_executable_network: 'IPFS' | 'ARWEAVE';
  distribution_rewards_submission: SubmissionsPerRound;
  distributions_audit_trigger: Record<
    string,
    Record<string, AuditTriggerState>
  >;
  distributions_audit_record: Record<
    string,
    'Uninitialized' | 'PayoutSuccessful' | 'PayoutFailed'
  >;
  task_vars: string;
  koii_vars: string;
  is_migrated: boolean;
  migrated_to: string;
  allowed_failed_distributions: number;

  token_type?: PublicKey;
  task_type: TaskType;
}

export interface Task {
  publicKey: string;
  data: TaskData;
}

type ROE = number;

export interface TaskMetadata {
  author: string;
  description: string;
  repositoryUrl: string;
  createdAt: number;
  imageUrl: string;
  migrationDescription: string;
  requirementsTags: RequirementTag[];
  infoUrl?: string | undefined;
  tags?: string[];
}

export interface RequirementTag {
  type: RequirementType;
  value?: string;
  description?: string;
  retrievalInfo?: string;
}

export enum RequirementType {
  GLOBAL_VARIABLE = 'GLOBAL_VARIABLE',
  TASK_VARIABLE = 'TASK_VARIABLE',
  CPU = 'CPU',
  RAM = 'RAM',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  ARCHITECTURE = 'ARCHITECTURE',
  OS = 'OS',
  ADDON = 'ADDON',
}

export interface TaskData {
  taskName: string;
  taskManager: string;
  isWhitelisted: boolean;
  isActive: boolean;
  taskAuditProgram: string;
  stakePotAccount: string;
  totalBountyAmount: ROE;
  bountyAmountPerRound: ROE;
  currentRound: number;
  availableBalances: Record<string, ROE>;
  stakeList: Record<string, ROE>;
  isRunning: boolean;
  hasError: boolean;
  metadataCID: string;
  minimumStakeAmount: ROE;
  roundTime: number;
  startingSlot: number;
  submissions: SubmissionsPerRound;
  distributionsAuditTrigger: Record<string, Record<string, AuditTriggerState>>;
  submissionsAuditTrigger: Record<string, Record<string, AuditTriggerState>>;
  isMigrated: boolean;
  migratedTo: string;
  distributionRewardsSubmission: SubmissionsPerRound;
  taskType?: 'KOII' | 'KPL';
  tokenType?: string;
}

export interface TaskRetryData {
  count: number;
  timestamp: number;
  cancelled: boolean;
  timerReference: number | null | undefined;
}

export enum RetrievalInfoActionType {
  GET = 'GET',
  POST = 'POST',
  BROWSER = 'BROWSER',
}

export type RetrievalInfo = {
  url: string;
  actionType: RetrievalInfoActionType;
  params: string[];
};
