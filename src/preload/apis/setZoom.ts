import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { zoomLevel: number }): Promise<boolean> =>
  sendMessage(config.endpoints.SET_ZOOM, payload);
