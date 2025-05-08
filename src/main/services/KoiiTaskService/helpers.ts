import { ErrorType } from 'models';
import { throwDetailedError } from 'utils/error';

export function handleTaskNotFoundError(pubkey: string, error: unknown): void {
  throwDetailedError({
    detailed: `Data with pubkey ${pubkey} not found`,
    type: ErrorType.TASK_NOT_FOUND,
  });
}
