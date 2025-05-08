import { max, sum } from 'lodash';
import { Task, TaskStatus } from 'renderer/types';

import { getCurrentSlot, getStakingAccountPublicKey } from './api';

import type { Submission, SubmissionsPerRound } from 'models';

const getLastRoundWithSubmissions = (
  allSubmissions: Record<string, Submission>[]
) => {
  return Object.keys(allSubmissions)
    .map(Number) // Convert keys to numbers since Object.keys returns string[]
    .sort((a, b) => b - a) // Sort rounds in descending order
    .find((round) => Boolean(allSubmissions[round])); // Find the first round that has submissions
};

export class TaskService {
  static getTotalStaked(task: Task): number {
    return sum(Object.values(task.stakeList));
  }

  static getMyStake(task: Task): Promise<number> {
    return getStakingAccountPublicKey().then(
      (pubKey) => task.stakeList[pubKey] || 0
    );
  }

  static getTaskSourceCode(
    taskAuditProgram: Task['taskAuditProgram']
  ): Promise<string> {
    return window.main.getTaskSource({ taskAuditProgram });
  }

  static getTopStake(task: Task): number {
    return max(Object.values(task?.stakeList || {})) || 0;
  }

  static getNodesCount(task: Task): number {
    return Object.values(task?.stakeList || {})?.length;
  }

  static getPendingRewardsByTask(
    task: Task,
    stakingAccountPublicKey: string
  ): number {
    return task.availableBalances[stakingAccountPublicKey];
  }

  static async getStatus(
    task: Task,
    stakingAccountPublicKey: string,
    isPrivate = false
  ): Promise<TaskStatus> {
    const isBlackListed = !task.isActive;
    const submissions = await window.main.getTaskSubmissions({
      taskPubKey: task.publicKey,
    });
    const allSubmissions = Object.entries(submissions);
    const submissionsFromCurrentAccount = allSubmissions.filter(
      ([_, submission]) =>
        Object.keys(submission).some((key) => key === stakingAccountPublicKey)
    );
    const currentSlot = await getCurrentSlot();
    const currentRound = Math.floor(
      (currentSlot - task.startingSlot) / task.roundTime
    );

    function getSubmissionsForLastNRounds(
      submissions: SubmissionsPerRound,
      currentRound: number,
      numberOfRounds: number
    ) {
      return Array.from(
        { length: numberOfRounds },
        (_, i) => submissions[currentRound - i]
      );
    }

    const hasSubmissionsOnlyInLast1Or2Rounds = getSubmissionsForLastNRounds(
      submissions,
      currentRound,
      3
    ).some((round) => round && stakingAccountPublicKey in round);

    const hasSubmissionsInAllLast3Rounds = [
      getSubmissionsForLastNRounds(submissions, currentRound, 3),
      getSubmissionsForLastNRounds(submissions, currentRound - 1, 3),
      getSubmissionsForLastNRounds(submissions, currentRound - 2, 3),
    ].some((rounds) =>
      rounds.every((round) => round && stakingAccountPublicKey in round)
    );

    const hasSubmissionsInSomeOfLast3Rounds = getSubmissionsForLastNRounds(
      submissions,
      currentRound,
      4
    ).some((round) => round && stakingAccountPublicKey in round);
    // const nodeHasBeenFlaggedAsMalicious =
    //   stakingAccountPublicKey in task.distributionsAuditTrigger ||
    //   stakingAccountPublicKey in submissionsAuditTrigger;
    const taskIsComplete = task.totalBountyAmount < task.bountyAmountPerRound;
    const { hasError } = task;

    if (isBlackListed) return TaskStatus.BLACKLISTED;
    // if (nodeHasBeenFlaggedAsMalicious) return TaskStatus.FLAGGED;
    if (hasError) return TaskStatus.ERROR;
    if (taskIsComplete) return TaskStatus.COMPLETE;
    if (!task.isRunning && hasSubmissionsInSomeOfLast3Rounds)
      return TaskStatus.COOLING_DOWN;
    if (!task.isRunning) return TaskStatus.STOPPED;
    if (!submissionsFromCurrentAccount?.length)
      return TaskStatus.PRE_SUBMISSION;
    if (hasSubmissionsInAllLast3Rounds) return TaskStatus.ACTIVE;
    else if (hasSubmissionsOnlyInLast1Or2Rounds) return TaskStatus.WARMING_UP;

    return TaskStatus.PRE_SUBMISSION;
  }

  static async getUnstakingAvailability(
    task: Task,
    stakingAccountPublicKey: string
  ): Promise<boolean> {
    const currentSlot = await getCurrentSlot();
    const currentRound = Math.floor(
      (currentSlot - task.startingSlot) / task.roundTime
    );

    const submissions =
      (await window.main.getTaskSubmissions({
        taskPubKey: task.publicKey,
      })) || {};

    const hasSubmissionsInSomeOfLast3Rounds = [
      submissions[currentRound],
      submissions[currentRound - 1],
      submissions[currentRound - 2],
      submissions[currentRound - 3],
      submissions[currentRound - 4],
    ].some((round) => round && stakingAccountPublicKey in round);
    const unstakeIsAvailable =
      !task.isRunning && !hasSubmissionsInSomeOfLast3Rounds;

    return unstakeIsAvailable;
  }
}
