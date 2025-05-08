export interface TaskVariableData {
  value: string;
  label: string;
}

export interface TaskVariableDataWithId extends TaskVariableData {
  id: string;
}

export type TaskVariables = Record<string, TaskVariableData>;

export type TaskId = string;
export type TaskVariableName = string;
export type DesktopNodeVariableID = string;

export type TaskPairing = Record<TaskVariableName, DesktopNodeVariableID>;

export type PairedTaskVariables = Record<TaskId, TaskPairing>;
