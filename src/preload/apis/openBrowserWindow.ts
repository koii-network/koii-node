import config from 'config';
import { OpenBrowserWindowParam } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (payload: OpenBrowserWindowParam) =>
  sendMessage(config.endpoints.OPEN_BROWSER_WINDOW, payload);
