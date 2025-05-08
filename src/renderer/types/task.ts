import { Task as TS, TaskData } from 'models/task';

export type Task = Omit<TS, 'data'> & TaskData;

export interface TaskWithStake extends Task {
  stake: number;
  minStake: number;
}

export enum TaskStatus {
  PRE_SUBMISSION = 'PRE_SUBMISSION',
  WARMING_UP = 'WARMING_UP',
  ACTIVE = 'ACTIVE',
  COOLING_DOWN = 'COOLING_DOWN',
  STOPPED = 'STOPPED',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
  FLAGGED = 'FLAGGED',
  BLACKLISTED = 'BLACKLISTED',
}
