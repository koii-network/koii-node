export enum PersistentStoreKeys {
  TaskVariables = 'TASK_VARIABLES',
  TaskToVariablesPairs = 'TaskToVariablesPairs',
  RunnedPrivateTasks = 'RunnedPrivateTasks',
}

export type StartStopAllTasksParams = {
  runOnlyScheduledTasks?: boolean;
};
