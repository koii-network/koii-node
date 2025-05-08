import { ChildProcess } from 'child_process';

import { Namespace } from '../node/helpers/Namespace';

export interface IRunningTasks {
  [key: string]: {
    namespace: Namespace;
    child: ChildProcess;
    expressAppPort: number;
    secret: string;
  };
}
