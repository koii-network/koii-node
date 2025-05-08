/* eslint-disable camelcase */
import * as fs from 'fs/promises';
import { createServer } from 'https';
import * as path from 'path';

import axios from 'axios';
import { Express, Request, Response } from 'express';
import { debounce } from 'lodash';
import koiiTasks from 'main/services/koiiTasks';
import { getUserConfig } from 'renderer/services/api';

import config from '../../../config';
import { DYNAMIC_DNS_URL } from '../../../config/node';
import errorHandler from '../../errorHandler';
import { getAppDataPath } from '../helpers/getAppDataPath';
import { namespaceInstance } from '../helpers/Namespace';
import execute from '../helpers/settleuPnP';
import startLocalTunnel from '../helpers/setTunneling';
import signPayload from '../helpers/signPayloadHelper';

import app from './app';

// Specify the log file path
const logFilePath = path.join(getAppDataPath(), 'logs', 'uPnP.log');

const PORT_5644 = 5644;
const PORT_443 = 443;
const MAX_LOCAL_TUNNEL_RETRIES = 7;

let localTunnelRetries = 0;
let isExpressListening = false;
let subdomain_assigned: string;

const initExpressApp = async (): Promise<Express | undefined> => {
  // skip stake for now

  if (isExpressListening) return;
  isExpressListening = true;
  const expressApp = app();

  expressApp.get('/id', (req: Request, res: Response) => {
    res.send(config.node.TASK_CONTRACT_ID);
  });

  expressApp.get('/tasks', async (req: Request, res: Response) => {
    const tasks = await koiiTasks.getStartedTasks();
    const tasksData = tasks
      .filter((e) => e.is_running)
      .map((task) => ({
        TaskName: task.task_name,
        TaskID: task.task_id,
      }));

    res.status(200).send(tasksData);
  });

  const port = config.node.SERVER_PORT;
  const server = expressApp.listen(port, () => {
    log(`Express server started @ http://localhost:${port}`);
  });

  const { networkingFeaturesEnabled } = await getUserConfig();

  if (networkingFeaturesEnabled) {
    await handleServerStart(server, expressApp);

    // expressApp.use((req, res, next) => {
    //   if (!req.secure && !isLocalhost(req)) {
    //     return res.redirect(`https://${req.headers.host}${req.url}`);
    //   }
    //   next();
    // });
  }

  // eslint-disable-next-line consistent-return
  return expressApp;
};

async function handleServerStart(server: any, expressApp: any) {
  try {
    // const { forceTunneling } = await getUserConfig();

    // if (forceTunneling) {
    //   log('Forcing tunneling');
    //   throw new Error('Forcing tunneling');
    // }

    await namespaceInstance.storeSet('Port_Exposure', 'Pending');
    await execute.openPortCommand(PORT_5644);
    log('Port successfully opened:', true);
    await namespaceInstance.storeSet('curr_port', PORT_5644.toString());

    const payloadData = await signPayload();
    const returnedDomainMessage = await getSubdomain(payloadData);
    subdomain_assigned = returnedDomainMessage.data.domain;
    log(
      'waiting for DNS propagation...',
      `${subdomain_assigned}:${PORT_5644.toString()}`
    );
    await namespaceInstance.storeSet('Port_Exposure', 'uPnP');
    await namespaceInstance.storeSet(
      'subdomain',
      `${subdomain_assigned}:${PORT_5644.toString()}`
    );
  } catch (error: any) {
    logToConsoleAndToLogFile(
      `An error occurred while trying uPnP: ${error.message}`,
      true
    );
    await setUpLocalTunnel();
  }
}

async function getSubdomain(payloadData: any): Promise<any> {
  try {
    log('Getting subdomain...');
    log('payloadData pubKey', payloadData.pubKey);
    log('payloadData signData', payloadData.signData);
    const response = await axios.post(`${DYNAMIC_DNS_URL}/dns/get_subdomain`, {
      signedData: payloadData.signData,
      publicKey: payloadData.pubKey,
    });
    if (response.status !== 200) {
      log('Error getting subdomain', response);
      throw new Error('Error getting subdomain');
    }
    log('Success getting subdomain');
    log(JSON.stringify(response?.data || '{}'));
    console.log(response.data);
    return response;
  } catch (error: any) {
    log(`Error getting subdomain custom: ${error}`);
    throw new Error(`Error getting subdomain: ${error.message}`);
  }
}

async function transitionToSecureServer(
  certParams: any,
  server: any,
  expressApp: any
): Promise<void> {
  try {
    execute.closePortCommand(PORT_5644);
    execute.openPortCommand(PORT_443);
    await namespaceInstance.storeSet('curr_port', PORT_443.toString());
    await new Promise<void>((resolve) => {
      // server.close(() => {
      log('Express server is being restarted for a secure connection...');
      const secure_server = createServer(certParams, expressApp);
      secure_server.listen(30018, () => {
        log(`Express server started @ http://${subdomain_assigned}:30018`);
        log('Express server is now secured with https!');
        resolve();
      });
      // });
    });
  } catch (error: any) {
    throw new Error(`Error transitioning to secure server: ${error.message}`);
  }
}

function logToConsoleAndToLogFile(message: string, isError?: boolean) {
  const consoleMethod = isError ? console.error : console.log;
  consoleMethod(message);
  log(message);
}

async function retryLocalTunnel() {
  setTimeout(async () => {
    logToConsoleAndToLogFile(
      `Retrying local tunneling... ${localTunnelRetries}`
    );
    localTunnelRetries += 1;
    await setUpLocalTunnel();
  }, 5000);
}

async function handleLocalTunnelError(error: Error) {
  await namespaceInstance.storeSet('Port_Exposure', 'Failure');
  logToConsoleAndToLogFile(
    `Error running local tunnel: ${error.message}`,
    true
  );
  const shouldRetry = localTunnelRetries < MAX_LOCAL_TUNNEL_RETRIES;

  if (!shouldRetry) {
    logToConsoleAndToLogFile(
      'Max retries reached, giving up on local tunneling',
      true
    );
    return;
  }
  await retryLocalTunnel();
}

async function setUpLocalTunnel(): Promise<void> {
  try {
    // close any opened port
    const curr_port = await namespaceInstance.storeGet('curr_port');
    if (curr_port && curr_port !== '0') {
      execute.closePortCommand(curr_port);
      await namespaceInstance.storeSet('curr_port', '0');
    }
    log('Falling back to proxy server...');
    const result = await startLocalTunnel();

    const debouncedHandleLocalTunnelError = debounce(async (error: Error) => {
      console.error('Error with the local tunnel: ', error.message);
      await handleLocalTunnelError(error);
    }, 2000);

    result?.tunnel?.on('error', async (error: Error) => {
      await debouncedHandleLocalTunnelError(error);
    });

    if (result.success) {
      log('Local tunnel started successfully!');
      log('Tunnel URL:', result.result);
      await namespaceInstance.storeSet('Port_Exposure', 'localtunnel');
      let subdomain = '';
      if (result.result) {
        const urlWithoutProtocol = result.result.replace(/^http?:\/\//, '');
        // eslint-disable-next-line prefer-destructuring
        subdomain = urlWithoutProtocol.split('/')[0];
      }
      await namespaceInstance.storeSet('subdomain', subdomain);
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    await handleLocalTunnelError(error);
  }
}

async function checkForExistingCert(): Promise<{
  csr: Buffer;
  key: Buffer;
  cert: string;
} | null> {
  const certsPath = path.join(getAppDataPath(), 'certs');
  try {
    const [cert, key, csr] = await Promise.all([
      fs.readFile(path.join(certsPath, 'cert'), 'utf-8'),
      fs.readFile(path.join(certsPath, 'key')),
      fs.readFile(path.join(certsPath, 'csr')),
    ]);
    log('Certs already exist, skipping cert generation');
    return { cert, key, csr };
  } catch (error: any) {
    console.warn('Could not read existing certs:', error.message);
    return null;
  }
}

// A helper function to determine if the request is from localhost
function isLocalhost(req: any) {
  const ip = req.connection.remoteAddress;
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

// Custom log function to write to the log file
function log(...args: any[]) {
  const message = args.join(' ');
  fs.appendFile(logFilePath, `${message}\n`, (err: any) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

export default errorHandler(initExpressApp, 'Init Express app error');
