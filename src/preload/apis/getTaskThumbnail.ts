import config from 'config';
import sendMessage from 'preload/sendMessage';

export default ({ url }: { url: string }): Promise<string | false> =>
  sendMessage(config.endpoints.GET_TASK_THUMBNAIL, { url });
