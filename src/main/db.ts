import { DbAdapter } from '@koii-network/task-node';

import { getAppDataPath } from './node/helpers/getAppDataPath';

export default DbAdapter.getInstance(`${getAppDataPath()}/KoiiDB.db`);
