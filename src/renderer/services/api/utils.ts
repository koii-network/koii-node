import axios from 'axios';
import { COINGECKO_API_BASE } from 'config/dashboard';
import { VIP_API_URL } from 'config/vip';
import { Task as TaskRaw } from 'models';
import { NetworkUrlType } from 'renderer/features/shared/constants';
import { Task } from 'renderer/types';

/** Utils */
export function parseTask({ data, publicKey }: TaskRaw): Task {
  return { publicKey, ...data };
}

export const getLogs = async (taskAccountPubKey: string, noOfLines = 500) => {
  const logs = await window.main.getTaskLogs({
    taskAccountPubKey,
    noOfLines,
  });
  console.log('--------------- NODE LOGS ----------------');
  console.log(logs);
  console.log('--------------- END OF NODE LOGS ----------------');
  return logs;
};

export const getMainLogs = () => {
  return window.main.getMainLogs({});
};

const createReferralCode = async (walletAddress: string) => {
  return window.main.createReferralCode(walletAddress);
};

export const getReferralCode = async (walletAddress: string) => {
  if (!walletAddress) return;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const {
        data: { code },
      } = await axios.get<{ code: string }>(
        `${VIP_API_URL}/get-referral-code/${walletAddress}`
      );
      return code;
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      retryCount++;
      if (retryCount <= maxRetries) {
        // Wait for 1 second before retrying
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        // eslint-disable-next-line no-continue
        continue;
      }
      // If all retries failed, use local fallback to get the referral code
      // eslint-disable-next-line consistent-return
      return createReferralCode(walletAddress);
    }
  }
};

export const switchLaunchOnRestart = async () => {
  return window.main.switchLaunchOnRestart();
};

export const limitLogsSize = async () => {
  return window.main.limitLogsSize();
};

export const enableStayAwake = async () => {
  return window.main.enableStayAwake();
};

export const disableStayAwake = async () => {
  return window.main.disableStayAwake();
};

export const getTaskMetadata = async (metadataCID: string) => {
  return window.main
    .getTaskMetadata({
      metadataCID,
    })
    .then((metadata) => {
      return metadata;
    });
};

export const switchNetwork = async (network: NetworkUrlType) => {
  return window.main.switchNetwork(network);
};

export const getNetworkUrl = async () => {
  return window.main.getNetworkUrl();
};

export const openLogfileFolder = async (taskPublicKey: string) => {
  if (!taskPublicKey) return false;
  return window.main.openLogfileFolder({
    taskAccountPublicKey: taskPublicKey,
  });
};

export const getActiveAccountName = async () => {
  return window.main.getActiveAccountName();
};

export const getVersion = async () => {
  return window.main.getVersion();
};

export const getPlatform = async () => {
  return window.main.getPlatform();
};

export const getMainAccountPublicKey = async (): Promise<string> => {
  const pubkey = await window.main.getMainAccountPubKey();
  return pubkey;
};

export const openBrowserWindow = async (URL: string) => {
  await window.main.openBrowserWindow({ URL });
};

export const appRelaunch = async () => {
  await window.main.appRelaunch();
};

export const saveTaskThumbnail = async (url: string) => {
  return window.main.saveTaskThumbnail({ url });
};

export const getTaskThumbnail = async (url: string) => {
  return window.main.getTaskThumbnail({ url });
};

export const getRPCStatus = async () => {
  return window.main.getRPCStatus();
};

export const fetchKoiiPrice = async () => {
  const response = await fetch(
    `${COINGECKO_API_BASE}/simple/price?ids=koii&vs_currencies=usd`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch KOII price');
  }

  const data = (await response.json()) as { koii: { usd: number } };
  return data?.koii?.usd;
};
