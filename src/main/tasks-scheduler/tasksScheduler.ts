import { startAllTasks } from '../controllers/startAllTasks';
import { stopAllTasks } from '../controllers/stopAllTask';
import { namespaceInstance } from '../node/helpers/Namespace';

import { TaskSchedulerService } from './TaskSchedulerService';

const taskScheduler = new TaskSchedulerService(
  namespaceInstance,
  () => {
    return startAllTasks({} as Event, { runOnlyScheduledTasks: true });
  },
  () => {
    return stopAllTasks({} as Event, { runOnlyScheduledTasks: true });
  }
);

export default taskScheduler;
