import { Event } from 'electron';

import * as readLastLines from 'read-last-lines';

import { ErrorType } from 'models';
import { GetTaskLogsParam, GetTaskLogsResponse } from 'models/api';
import { throwDetailedError } from 'utils';

import { getAppDataPath } from '../node/helpers/getAppDataPath';

const getTaskLogs = async (
  event: Event,
  payload: GetTaskLogsParam
): Promise<GetTaskLogsResponse> => {
  const { taskAccountPubKey, noOfLines } = payload;

  try {
    const contents = await readLastLines.read(
      `${getAppDataPath()}/namespace/${taskAccountPubKey}/task.log`,
      noOfLines
    );
    return contents;
  } catch (e: any) {
    console.error(e);
    return throwDetailedError({
      detailed: e,
      type: ErrorType.NO_TASK_SOURCECODE,
    });
  }
};

export default getTaskLogs;
