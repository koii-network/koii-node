import { find, flatten } from 'lodash';
import { Task } from 'renderer/types';

export type PaginatedStartedTasksData = {
  pages: Page[];
};

type Page = {
  content: Task[];
  hasNext: boolean;
  itemsCount: number;
};

function findTaskByAuditProgram(
  paginatedData: PaginatedStartedTasksData,
  taskAuditProgram: string
) {
  const flattenedContent = flatten(
    paginatedData.pages.map((page) => page.content)
  );

  const foundTask = find(flattenedContent, { taskAuditProgram });

  return {
    taskId: foundTask?.publicKey || '',
    taskName: foundTask?.taskName || '',
  };
}

export async function getTaskBasedOnAuditProgram(
  taskAuditProgramId: string,
  startedTasksFromCache: PaginatedStartedTasksData
): Promise<{ taskId: string; taskName: string }> {
  const task = findTaskByAuditProgram(
    startedTasksFromCache,
    taskAuditProgramId
  );

  return task;
}
