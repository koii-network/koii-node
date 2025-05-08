import { IpcRendererEvent, ipcRenderer } from 'electron';

import { RendererEndpoints } from 'config/endpoints';

export default function onSystemWakeUp(
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  ipcRenderer.removeAllListeners(RendererEndpoints.SYSTEM_WAKE_UP);
  ipcRenderer.on(RendererEndpoints.SYSTEM_WAKE_UP, callback);
}
