import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onK2ConnectionError(
  callback: (event: IpcRendererEvent) => void
) {
  ipcRenderer.on(RendererEndpoints.K2_CONNECTION_ERROR, callback);
  return () =>
    ipcRenderer.removeAllListeners(RendererEndpoints.K2_CONNECTION_ERROR);
}
