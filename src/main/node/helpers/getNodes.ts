import { INode } from '@koii-network/task-node';

import { getCacheNodes } from './Namespace';

// get returntype of getCacheNodes
type GetCacheNodesReturnType = ReturnType<typeof getCacheNodes>;

export default async (taskIdParam: string): Promise<any> => {
  let nodes: Array<INode> = [];
  try {
    nodes = await getCacheNodes(taskIdParam);
  } catch (err: any) {
    console.error('Get nodes error: ', err.message);
  }

  return nodes;
};
