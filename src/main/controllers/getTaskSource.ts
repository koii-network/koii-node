import { Event } from 'electron';

import { ErrorType, GetTaskSourceParam } from 'models';
import { throwDetailedError } from 'utils';

import { fetchFromIPFSOrArweave } from './fetchFromIPFSOrArweave';

export const getTaskSource = async (
  _: Event,
  { taskAuditProgram }: GetTaskSourceParam
): Promise<string> => {
  try {
    const sourceCode = await fetchFromIPFSOrArweave(
      taskAuditProgram,
      'main.js'
    );

    if (!sourceCode) {
      return throwDetailedError({
        detailed: `No Task source found of ID ${taskAuditProgram} to fetch`,
        type: ErrorType.NO_TASK_SOURCECODE,
      });
    }

    return sourceCode;
  } catch (e: any) {
    console.error(e);
    return throwDetailedError({
      detailed: e,
      type: ErrorType.NO_TASK_SOURCECODE,
    });
  }
};
