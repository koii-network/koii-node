import config from 'config';
import { getStoredTaskVariables } from 'main/controllers/taskVariables/getStoredTaskVariables';
import { fetchWithTimeout } from 'main/node/helpers';
import { ErrorType } from 'models';
import { throwDetailedError } from 'utils';
import { Web3Storage } from 'web3.storage';

function makeStorageClient(token: string) {
  return new Web3Storage({ token });
}

export async function retrieveFromIPFS(
  cid: string,
  fileName: string
): Promise<string> {
  const storedTaskVariables = await getStoredTaskVariables();
  const userWeb3StorageKey = Object.values(storedTaskVariables).find(
    ({ label }) => label === 'WEB3_STORAGE_KEY'
  )?.value;

  try {
    if (userWeb3StorageKey) {
      const client = makeStorageClient(userWeb3StorageKey);
      return retrieveThroughClient(client, cid);
    } else {
      return retrieveThroughHttpGateway(cid, fileName);
    }
  } catch (error: any) {
    return throwDetailedError({
      detailed: error,
      type: ErrorType.GENERIC,
    });
  }
}

async function retrieveThroughClient(
  client: Web3Storage,
  cid: string
): Promise<string> {
  console.log('use Web3.storage client');
  const response = await client.get(cid);
  if (!response?.ok) {
    return throwDetailedError({
      detailed: `Failed to get ${cid} from IPFS`,
      type: ErrorType.GENERIC,
    });
  }
  const files = await response.files();
  const textDecoder = new TextDecoder();
  return textDecoder.decode(await files[0].arrayBuffer());
}

async function retrieveThroughHttpGateway(
  cid: string,
  fileName = ''
): Promise<string> {
  console.log('use IPFS HTTP gateway');

  const listOfIpfsGatewaysUrls = [
    `https://s3.koii.network/koii-k2-task-metadata/${cid}/${fileName}`,
    `https://${cid}.ipfs.w3s.link/${fileName}`,
    `https://ipfs-gateway.koii.live/ipfs/${cid}/${fileName}`,
    `https://${cid}.ipfs.dweb.link/${fileName}`,
    `https://gateway.ipfs.io/ipfs/${cid}/${fileName}`,
    `${config.node.IPFS_GATEWAY_URL}/${cid}/${fileName}`,
    `https://ipfs.eth.aragon.network/ipfs/${cid}/${fileName}`,
  ];

  for (const url of listOfIpfsGatewaysUrls) {
    try {
      const response = await fetchWithTimeout(url);
      const fileContent = await response.text();
      const couldNotFetchActualFileContent = fileContent.startsWith('<');

      if (!couldNotFetchActualFileContent) {
        return fileContent;
      }

      console.log(`Gateway failed at ${url}, trying next if available.`);
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
    }
  }

  throw Error(`Failed to get ${cid} from IPFS`);
}
