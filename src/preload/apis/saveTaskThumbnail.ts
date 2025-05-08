import config from 'config';
import sendMessage from 'preload/sendMessage';

export default ({ url }: { url: string }): Promise<void> =>
  sendMessage(config.endpoints.SAVE_TASK_THUMBNAIL, { url });
