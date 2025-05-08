/* eslint-disable no-prototype-builtins */
import { Event } from 'electron';

import { namespaceInstance } from 'main/node/helpers/Namespace';
import { getTaskDataFromCache } from 'main/services/tasks-cache-utils';
import { SubmissionsPerRound } from 'models';

const findEntryByPublicKey = (
  submissions: SubmissionsPerRound,
  publicKey: string
) => {
  const keys = Object.keys(submissions).sort(
    (a: string, b: string) => Number(b) - Number(a)
  );

  for (const key of keys) {
    if (submissions[key] && submissions[key][publicKey]) {
      return submissions[key][publicKey];
    }
  }
  return null;
};

export type GetTaskLastSubmissionTimeParams = {
  taskPublicKey: string;
  stakingPublicKey: string;
  averageSlotTime: number;
};

export const getLastSubmissionTime = async (
  _: Event,
  {
    taskPublicKey,
    stakingPublicKey,
    averageSlotTime,
  }: GetTaskLastSubmissionTimeParams
) => {
  const currentSlot = await namespaceInstance.getCurrentSlot();
  const submissions =
    (await getTaskDataFromCache(taskPublicKey, 'submissions'))?.submissions ||
    {};
  const lastSubmission = findEntryByPublicKey(submissions, stakingPublicKey);

  if (lastSubmission) {
    const lastSubmissionSlot = lastSubmission.slot;
    const timeInMs = (currentSlot - lastSubmissionSlot) * averageSlotTime;
    return timeInMs;
  }

  return 0;
};
