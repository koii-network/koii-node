import { SystemDbKeys } from 'config/systemDbKeys';
import db from 'main/db';

export const getTaskIdByTaskAuditProgramId = async (
  _: Event,
  payload: { taskAuditProgramId: string }
): Promise<string> => {
  const currentMapString = await db.get(SystemDbKeys.TaskIdToAuditProgramIdMap);
  const currentMap: Record<string, string> = currentMapString
    ? (JSON.parse(currentMapString as string) as Record<string, string>)
    : {};

  if (!currentMap) {
    throw new Error(
      `getTaskByTaskAuditProgramId: No Task ID found for the given Task Audit Program ID ${payload.taskAuditProgramId}`
    );
  }

  return currentMap[payload.taskAuditProgramId];
};
