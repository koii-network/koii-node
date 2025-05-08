import { INode } from '@koii-network/task-node';
import axios from 'axios';
import { getK2NetworkUrl } from 'main/node/helpers/k2NetworkUrl';

import db from '../../db';
import { NodeNamespace } from '../../NodeNamespace';

const BUNDLER_NODES = '/nodes';

// Singletons
/**
 * Namespace wrapper over APIs needed in Koii tasks
 */
const rpcUrl = getK2NetworkUrl();

const namespaceInstance = new NodeNamespace({
  taskTxId: '',
  serverApp: null,
  mainSystemAccount: null,
  taskData: {},
  taskType: '',
  db,
  rpcUrl,
});

/**
 * Gets the node registry from Redis cache
 * @returns {Array<BundlerPayload<data:RegistrationData>>}
 */
async function getCacheNodes(taskIdParam: string): Promise<INode[]> {
  // Get nodes from cache
  let taskId = taskIdParam;
  if (!taskId) taskId = '';
  let nodes;
  try {
    nodes = JSON.parse(
      (await namespaceInstance.storeGet(`nodesRegistry-${taskId}`)) || '[]'
    );
    if (nodes === null) nodes = [];
  } catch (e) {
    console.error(e);
    nodes = [];
  }
  return nodes as Array<INode>;
}
/**
 * Gets an array of service nodes
 * @param url URL of the service node to retrieve the array from a known service node
 * @returns Array of service nodes
 */
async function getNodes(url: string): Promise<Array<INode>> {
  try {
    const res = await axios.get<INode[]>(url + BUNDLER_NODES);
    console.log('RESPONSE FROM GET NODES', res.data);
    return res.data;
  } catch (_e) {
    return [];
  }
}

export {
  getCacheNodes,
  getNodes,
  NodeNamespace as Namespace,
  namespaceInstance,
};
