import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (payload: { taskAuditProgramId: string }): Promise<string> =>
  sendMessage(config.endpoints.GET_TASK_ID_BY_TASK_AUDIT_PROGRAM_ID, payload);
