import { bootstrap } from '@_koii/orca-node';

import { checkOrcaMachineExistsAndRuns } from '../../controllers/orca/checkOrcaMachineExistsAndRuns';
import { fixPath } from '../../controllers/orca/installation/fixPathMac';
import { startOrcaVM } from '../../controllers/orca/startOrcaVm';
import errorHandler from '../../errorHandler';

fixPath();

let isOrcaInitialized = false;

const initOrca = async (): Promise<void> => {
  const { isPodmanInstalled, isOrcaVMInstalled, isOrcaVMRunning } =
    await checkOrcaMachineExistsAndRuns();
  if (!isPodmanInstalled) {
    throw new Error("Podman doesn't exist");
  }
  if (!isOrcaVMInstalled) {
    throw new Error("Orca VM doesn't exist");
  }
  if (!isOrcaVMRunning) {
    await startOrcaVM();
    await waitUntilOrcaIsRunning();
    console.log('Orca VM is running now');
  }
  if (!isOrcaInitialized) {
    console.log('Calling Orca bootstrap');

    // Create an instance of ORCA
    const orcaInstance = await bootstrap();

    // Call the initialize function to start the ORCA
    // Install prerequisite
    orcaInstance.installPrerequisites();

    orcaInstance.setErrorHandler((msg: string) =>
      console.error('ORCA [ERROR]: ', msg)
    );
    orcaInstance.setWarnHandler((msg: string) =>
      console.warn('ORCA [WARNING]: ', msg)
    );
    orcaInstance.setLogHandler((msg: string) =>
      console.log('ORCA [INFO]: ', msg)
    );

    isOrcaInitialized = true;
  }
};

const waitUntilOrcaIsRunning = async () => {
  let isOrcaRunning = false;
  let retry = 0;
  while (!isOrcaRunning) {
    if (retry > 150) break;
    // 150 retries means 5 minutes
    await sleep(2000);
    const { isOrcaVMRunning } = await checkOrcaMachineExistsAndRuns();
    isOrcaRunning = isOrcaVMRunning;
    retry += 1;
  }
};
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default errorHandler(initOrca, 'Init Orca app error');
