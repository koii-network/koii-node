import { contextBridge } from 'electron';

import apis from '../preload/apis';

contextBridge.exposeInMainWorld('main', apis);
