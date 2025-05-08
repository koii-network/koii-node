import errorHandler from '../../errorHandler';

import getNodes from './getNodes';
import { Namespace } from './Namespace';
import regNodes from './regNodes';

export * from './wallets';
export * from './fetchWithTimeout';
export * from './forceKillChildProcess';

export default {
  getNodes: errorHandler(getNodes, 'Get nodes error'),
  regNodes: errorHandler(regNodes, 'Register node error'),
  Namespace,
};
