import executeTasks from './executeTasks';
import { getMainSystemAccountKeypair } from './helpers';

export const loadAndExecuteTasks = async (): Promise<void> => {
  try {
    if (await getMainSystemAccountKeypair()) {
      console.info('Executing TASKS');

      await executeTasks();
    }
  } catch (e: any) {
    console.error('ERROR In TASK start', e);
  }
};
