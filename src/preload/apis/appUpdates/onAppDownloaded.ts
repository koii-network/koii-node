import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onAppDownloaded(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.on(RendererEndpoints.UPDATE_DOWNLOADED, callback);
  return () =>
    ipcRenderer.removeAllListeners(RendererEndpoints.UPDATE_DOWNLOADED);
}
