import { ipcRenderer } from 'electron';

const sendMessage = <T>(api: string, payload: unknown): Promise<T> =>
  ipcRenderer.invoke(api, payload);

export default sendMessage;
