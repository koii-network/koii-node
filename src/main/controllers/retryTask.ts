import { Keypair } from '@_koii/web3.js';
import { TaskData as TaskNodeTaskData } from '@koii-network/task-node';
import { MAX_TASK_RETRY_TIME, TASK_STABILITY_THRESHOLD } from 'config/node';
import { SystemDbKeys } from 'config/systemDbKeys';
import { Application } from 'express';
import { get } from 'lodash';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import koiiTasks from 'main/services/koiiTasks';
import { TaskRetryData } from 'models';

const retryTask = async (
  selectedTask: Required<TaskNodeTaskData> & {
    stake_list: Record<string, number>;
  },
  expressApp: Application,
  OPERATION_MODE: string,
  mainSystemAccount: Keypair,
  executeTasks: any
) => {
  // get task retry data
  const allTaskRetryData: {
    [key: string]: TaskRetryData;
  } = (await namespaceInstance.storeGet(SystemDbKeys.TaskRetryData)) || {};
  let taskRetryData = get(allTaskRetryData, selectedTask.task_id, null);

  // set default task retry data if null
  if (!taskRetryData) {
    taskRetryData = {
      count: 0,
      timestamp: Date.now(),
      cancelled: false,
      timerReference: null,
    };
  }

  if (!taskRetryData.cancelled) {
    const retryInterval = 2 ** (taskRetryData.count + 1) * 1000;
    const retryTime = Math.min(retryInterval, MAX_TASK_RETRY_TIME);

    console.log(
      `WILL RETRY [${selectedTask.task_name}] IN ${
        2 ** (Number(taskRetryData?.count) + 1)
      } SECONDS`
    );

    const timerReference = setTimeout(async () => {
      console.log(`RETRY TASK [${selectedTask.task_name}]`);
      const allTaskRetryData =
        (await namespaceInstance.storeGet(SystemDbKeys.TaskRetryData)) || {};

      taskRetryData = get(allTaskRetryData, selectedTask.task_id, null);
      if (taskRetryData) {
        if (!taskRetryData?.cancelled) {
          // recursive method call
          const { namespace, child, expressAppPort, secret } =
            await executeTasks(
              selectedTask,
              expressApp,
              OPERATION_MODE,
              mainSystemAccount
            );

          await koiiTasks.startTask(
            selectedTask.task_id,
            namespace,
            child,
            expressAppPort,
            secret
          );

          if (
            Date.now() - taskRetryData.timestamp >=
            TASK_STABILITY_THRESHOLD
          ) {
            taskRetryData.count = 0;
          } else {
            taskRetryData.count += 1;
          }

          taskRetryData.timestamp = Date.now();
          taskRetryData.timerReference = null;

          const payload: any = {
            ...allTaskRetryData,
            [selectedTask.task_id]: taskRetryData,
          };

          await namespaceInstance.storeSet(SystemDbKeys.TaskRetryData, payload);
        } else {
          console.log('ABORT TASK RETRY');
        }
      }
    }, retryTime);

    // store timerReference
    taskRetryData.timerReference = timerReference[Symbol.toPrimitive](); // get timeoutId in number
    taskRetryData.timestamp = Date.now();
    const payload: any = {
      ...taskRetryData,
      [selectedTask.task_id]: taskRetryData,
    };
    namespaceInstance.storeSet(SystemDbKeys.TaskRetryData, payload);
  }
};

export default retryTask;
