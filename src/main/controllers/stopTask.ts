import { Event } from 'electron';

import koiiTasks from 'main/services/koiiTasks';
import { TaskStartStopParam } from 'models/api';

const stopTask = async (event: Event, payload: TaskStartStopParam) => {
  const { taskAccountPubKey } = payload;

  await koiiTasks.stopTask(taskAccountPubKey);
  return true;
};

export default stopTask;
