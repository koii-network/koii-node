import config from 'config';
import { type ScheduleMetadata } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: ScheduleMetadata): Promise<boolean> =>
  sendMessage(config.endpoints.VALIDATE_SCHEDULER_SESSION, payload);
