import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onAppUpdate(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.on(RendererEndpoints.UPDATE_AVAILABLE, callback);
  return () =>
    ipcRenderer.removeAllListeners(RendererEndpoints.UPDATE_AVAILABLE);
}
