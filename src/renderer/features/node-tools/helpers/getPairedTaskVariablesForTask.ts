import { PairedTaskVariables } from 'models';

export const getPairedTaskVariablesForTask = (
  taskPubKey: string,
  pairedVariables?: PairedTaskVariables
) => {
  return pairedVariables?.[taskPubKey] ?? {};
};
