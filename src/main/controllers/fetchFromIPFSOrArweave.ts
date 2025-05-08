import * as isIPFS from 'is-ipfs';

import axios from 'axios';
import config from 'config';
import { retrieveFromIPFS } from 'services/ipfs';

export const fetchFromIPFSOrArweave = async (
  cid: string,
  fileName: string
): Promise<string> => {
  const isTaskDeployedToIPFS = isIPFS.cid(cid);

  const retrieveFromArweave = async (cid: string): Promise<string> =>
    (
      await axios.get<string>(`${config.node.ARWEAVE_GATEWAY_URL}/${cid}`, {
        transformResponse: [], // disable auto JSON parse
      })
    )?.data;

  const fileContent = isTaskDeployedToIPFS
    ? await retrieveFromIPFS(cid, fileName)
    : await retrieveFromArweave(cid);

  return fileContent;
};
