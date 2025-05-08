import React from 'react';
import toast from 'react-hot-toast';

import { getKoiiFromRoe } from 'utils';

type GetErrorMessageParams = {
  hasEnoughKoii: boolean;
  minStake: number | undefined;
  isTaskRunning: boolean;
  hasMinimumStake: boolean;
  isTaskToolsValid: boolean;
  isActive?: boolean;
  isUsingNetworking: boolean;
  userHasNetworkingEnabled: boolean;
};

// TO DO: unify error messages logic on private and whitelisted tasks

export const getErrorMessage = ({
  hasEnoughKoii,
  minStake,
  isTaskRunning,
  hasMinimumStake,
  isTaskToolsValid,
  isActive,
  isUsingNetworking,
  userHasNetworkingEnabled,
}: GetErrorMessageParams) => {
  if (isTaskRunning) return [];
  console.log({ isActive });

  const conditions = [
    { condition: hasEnoughKoii, errorMessage: 'have enough KOII to stake' },
    {
      condition: hasMinimumStake,
      errorMessage: `stake at least ${getKoiiFromRoe(
        minStake || 0
      )} KOII on this Task`,
    },
    {
      condition: isTaskToolsValid,
      errorMessage: 'configure the Task extensions',
    },
    {
      condition: isActive,
      errorMessage: 'are trying to run an active task',
    },
    {
      condition:
        !isUsingNetworking || (isUsingNetworking && userHasNetworkingEnabled),
      errorMessage: "enable Networking in your node's settings",
    },
  ];

  const errors = conditions
    .filter(({ condition }) => !condition)
    .map(({ errorMessage }) => errorMessage);

  return errors;
};

export const showTaskRunErrorToast = (taskName: string | undefined) => {
  if (taskName === '') return;
  toast.error(`Task ${taskName} running failed. Please try again!`);
};

export function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  }

  if (errors.length === 1) {
    return <p>Make sure you {errors[0]}.</p>;
  }

  const errorListItems = errors.map((error, index) => (
    <li key={index}>• {error}</li>
  ));

  return (
    <div>
      Make sure you:
      <br />
      <ul>{errorListItems}</ul>
    </div>
  );
}
