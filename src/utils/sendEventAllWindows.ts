import { BrowserWindow } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export const sendEventAllWindows = (
  event: RendererEndpoints,
  payload?: unknown
) => {
  const windows = BrowserWindow.getAllWindows();
  /**
   * Send event to all windows instances
   */
  windows.forEach((window) => {
    window.webContents.send(event, payload ?? {});
  });
};
