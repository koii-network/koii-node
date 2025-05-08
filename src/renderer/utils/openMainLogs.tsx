import toast from 'react-hot-toast';

import { getMainLogs } from 'renderer/services';

export const openMainLogs = async () => {
  try {
    await getMainLogs();
  } catch (err) {
    toast.error('Failed to retrieve the logs');
  }
};
