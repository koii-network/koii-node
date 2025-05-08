import { getCurrentSlot as getCurrentSlotTaskNode } from '@koii-network/task-node';
import sdk from 'main/services/sdk';

const getCurrentSlot = async (): Promise<number> =>
  getCurrentSlotTaskNode(sdk.k2Connection as any);

export default getCurrentSlot;
