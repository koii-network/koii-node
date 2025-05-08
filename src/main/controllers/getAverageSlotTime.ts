import { getAverageSlotTime } from '@koii-network/task-node';
import sdk from 'main/services/sdk';

const getAvgSlotTime = async (): Promise<number> => {
  const avgSlotTime = await getAverageSlotTime(sdk.k2Connection as any);
  return avgSlotTime || 420;
};

export default getAvgSlotTime;
