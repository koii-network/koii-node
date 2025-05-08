import { shell } from 'electron';

import { OpenBrowserWindowParam } from 'models/api';

const openBrowserWindow = async (_: Event, { URL }: OpenBrowserWindowParam) => {
  shell.openExternal(URL);
};

export default openBrowserWindow;
