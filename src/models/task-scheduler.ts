import { CronJob } from 'cron';

export interface ScheduleMetadata {
  id: string;
  startTime: TimeFormat;
  stopTime: TimeFormat | null;
  days: number[];
  isEnabled: boolean;
}

export interface Schedule extends ScheduleMetadata {
  startJob: CronJob | null;
  stopJob: CronJob | null;
}

type Hours = `${number}`;
type Minutes = number;
type Seconds = number;
export type TimeFormat = `${Hours}:${Minutes}:${Seconds}`;

export type ScheduleMetadataUpdateType = Partial<ScheduleMetadata> & {
  id: string;
};
