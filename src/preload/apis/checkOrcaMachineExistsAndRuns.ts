import config from 'config';
import { checkOrcaMachineExistsAndRunsResponse } from 'models/api';
import sendMessage from 'preload/sendMessage';

export default (
  shouldPrintLogs = true
): Promise<checkOrcaMachineExistsAndRunsResponse> =>
  sendMessage(
    config.endpoints.CHECK_ORCA_MACHINE_EXISTS_AND_RUNS,
    shouldPrintLogs
  );
