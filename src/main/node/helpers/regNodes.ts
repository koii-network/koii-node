import { registerNodes } from '@koii-network/task-node';

import { namespaceInstance } from './Namespace';

export default async (newNodes: any[], taskId: string) => {
  return registerNodes(newNodes, taskId, namespaceInstance);
};
