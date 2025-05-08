import config from 'config';
import { ArchiveTaskParams } from 'models';
import sendMessage from 'preload/sendMessage';

export default (payload: ArchiveTaskParams): Promise<void> =>
  sendMessage(config.endpoints.ARCHIVE_TASK, payload);
