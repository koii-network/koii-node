import config from 'config';
import sendMessage from 'preload/sendMessage';

export default () => sendMessage(config.endpoints.APP_RELAUNCH, {});
