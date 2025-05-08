/* eslint-disable @cspell/spellchecker */

import {
  TaskVariableData,
  TaskVariableDataWithId,
  PairTaskVariableParamType,
} from 'models';

export const editTaskVariable = async ({
  id,
  label,
  value,
}: TaskVariableDataWithId) => {
  await window.main.editTaskVariable({
    variableId: id,
    variableData: { label, value },
  });
};

export const pairTaskVariable = async ({
  taskAccountPubKey,
  variableInTaskName,
  desktopVariableId,
}: PairTaskVariableParamType) => {
  await window.main.pairTaskVariable({
    taskAccountPubKey,
    variableInTaskName,
    desktopVariableId,
  });
};

export const deleteTaskVariable = async (id: string) => {
  await window.main.deleteTaskVariable(id);
};

export const getTasksPairedWithVariable = async (variableId: string) => {
  return window.main.getTasksPairedWithVariable({ variableId });
};

export const storeTaskVariable = async ({ label, value }: TaskVariableData) => {
  await window.main.storeTaskVariable({ label, value });
};

export const getStoredTaskVariables = async () => {
  return window.main.getStoredTaskVariables();
};

export const getTaskVariablesNames = async (taskPublicKey: string) => {
  return window.main.getTaskVariablesNames({ taskPublicKey });
};

export const getStoredPairedTaskVariables = async () => {
  return window.main.getStoredPairedTaskVariables();
};

export const getTaskPairedVariablesNamesWithLabels = async (
  taskAccountPubKey: string
) => {
  return window.main.getTaskPairedVariablesNamesWithLabels({
    taskAccountPubKey,
  });
};
