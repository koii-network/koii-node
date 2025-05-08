import { Connection } from '@_koii/web3.js';
import { RendererEndpoints } from 'config/endpoints';
import fetch from 'cross-fetch';
import { getK2NetworkUrl } from 'main/node/helpers/k2NetworkUrl';
import { setLocalStorage } from 'main/util';
import { sendEventAllWindows } from 'utils/sendEventAllWindows';

let errorsCount = 0;
let errorsTimestamp = 0;

const handleRateLimitError = () => {
  const nowTimestamp = String(new Date().getTime());
  setLocalStorage('is-rate-limited-by-k2', nowTimestamp);
};

const handleK2ConnectionError = () => {
  const lastErrorIsOlderThan15Minutes =
    Date.now() - errorsTimestamp >= 15 * 60 * 1000;
  errorsTimestamp = Date.now();
  console.log({ lastErrorIsOlderThan15Minutes, errorsCount });
  if (lastErrorIsOlderThan15Minutes) {
    errorsCount = 1;
  } else {
    errorsCount += 1;
  }
  const shouldNotifyTheFrontend = errorsCount > 4;
  if (shouldNotifyTheFrontend) {
    sendEventAllWindows(RendererEndpoints.K2_CONNECTION_ERROR);
  }
};

const k2NetworkUrl = getK2NetworkUrl();
const k2Connection = new Connection(k2NetworkUrl, {
  disableRetryOnRateLimit: true,

  customFetch: async (input: RequestInfo, init?: RequestInit) => {
    try {
      const response = await fetch(input, init);
      if (!response.ok) {
        handleK2ConnectionError();
      }
      if (!response.ok && response.status === 429) {
        handleRateLimitError();
      }
      return response;
    } catch (error: any) {
      const isK2ConnectionError =
        (error instanceof Error &&
          (error.message.includes('Transaction was not confirmed in') ||
            error.message.includes('502 Bad Gateway') ||
            error.message.includes('504 Gateway'))) ||
        error.message.includes('Blockhash not found') ||
        error.message.includes('Node is behind by');

      console.log('NETWORK ERROR', error.message, { isK2ConnectionError });
      if (isK2ConnectionError) {
        handleK2ConnectionError();
      }

      if (error instanceof Error && error.message.includes('429')) {
        handleRateLimitError();
      }
      throw error;
    }
  },
});

export default {
  k2Connection,
};
