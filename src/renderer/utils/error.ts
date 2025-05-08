import { DetailedError, ErrorType } from 'models';

// eslint-disable-next-line no-shadow
export enum ErrorContext {
  CLAIM_REWARD = 'CLAIM_REWARD',
  DELEGATE_STAKE = 'DELEGATE_STAKE',
  GET_EARNED_REWARDS = 'GET_EARNED_REWARDS',
  GET_PUBLIC_KEY = 'GET_PUBLIC_KEY',
  GET_STAKING_PUBLIC_KEY = 'GET_STAKING_PUBLIC_KEY',
  START_TASK = 'START_TASK',
  WITHDRAW_STAKE = 'WITHDRAW_STAKE',
}

const isErrorType = (error: string): error is ErrorType =>
  Object.keys(ErrorType).includes(error);

export const getErrorToDisplay = (
  error: Error | string,
  context?: ErrorContext
) => {
  if (!error) return undefined;
  if (typeof error === 'string') {
    const errorMessage =
      isErrorType(error) && typeof errorTypeToContent[error] === 'string'
        ? // apparently TS is not smart enough to recognize it's a string even after the check above, so this is a safe casting
          (errorTypeToContent[error] as string)
        : error.includes('502 Bad Gateway')
        ? 'There was a network issue, please try again later'
        : error;

    return errorMessage;
  }

  const isDetailedError = error.message.includes('"type":');

  if (isDetailedError) {
    const serializedError = error.message.substring(error.message.indexOf('{'));
    const parsedError = JSON.parse(serializedError) as DetailedError;
    const errorContent = errorTypeToContent[parsedError.type];
    const hasContext = typeof errorContent !== 'string';
    const errorMessage =
      hasContext && context
        ? `${errorContent.mainMessage}${errorContent.contextToSuffix[context]}`
        : `${errorContent || parsedError.detailed}`;

    return errorMessage;
  }
  return error?.message;
};

export const errorTypeToContent: Record<
  ErrorType,
  | string
  | {
      mainMessage: string;
      contextToSuffix: Partial<Record<ErrorContext, string>>;
    }
> = {
  [ErrorType.NO_VALID_MNEMONIC]:
    'Please provide a valid mnemonic to generate wallets',
  [ErrorType.CONTRACT_ID_NOT_FOUND]: 'Something went wrong. Please try again',
  [ErrorType.NO_ACTIVE_ACCOUNT]: {
    mainMessage: 'Select an account',
    contextToSuffix: {
      [ErrorContext.CLAIM_REWARD]: ' to claim rewards',
      [ErrorContext.DELEGATE_STAKE]: ' to delegate stake on this Task',
      [ErrorContext.GET_EARNED_REWARDS]: ' to get the earned rewards',
      [ErrorContext.GET_PUBLIC_KEY]: ' to get its public key',
      [ErrorContext.GET_STAKING_PUBLIC_KEY]: ' to get its staking public key',
      [ErrorContext.START_TASK]: ' to start this Task',
      [ErrorContext.WITHDRAW_STAKE]: ' to withdraw from this Task',
    },
  },
  [ErrorType.INSUFFICIENT_FUNDS_FOR_FEES]: {
    mainMessage:
      'Insufficient balance on your main key to cover transaction fees',
    contextToSuffix: {
      [ErrorContext.CLAIM_REWARD]: ' for claiming.',
    },
  },
  [ErrorType.NO_ACCOUNT_KEY]:
    "This account doesn't seem to be connected properly. Select another account to continue or see the Settings page to import a new account",
  [ErrorType.TASK_NOT_FOUND]:
    "Hmm... We can't find this Task, try a different one",
  [ErrorType.NO_TASK_SOURCECODE]:
    'There was an error collecting the Task sourcecode from IPFS or Arweave. Try again or let us know about the issue',
  [ErrorType.NO_TASK_METADATA]:
    'There was an error collecting the Task metadata from IPFS or Arweave. Try again or let us know about the issue',
  [ErrorType.NO_RUNNING_TASK]:
    "All good here, that task isn't running right now",
  [ErrorType.TRANSACTION_TIMEOUT]:
    'Whoops! Your transaction was not confirmed, please try again',
  [ErrorType.GENERIC]: 'Something went wrong. Please try again',
  [ErrorType.NO_MNEMONIC]: 'Please provide a mnemonic to generate wallets',
  [ErrorType.NO_JSON_KEY]: 'Please provide a key to generate wallets',
  [ErrorType.DUPLICATE_ACCOUNT]:
    'A wallet with the same mnemonic already exists',
  [ErrorType.NO_VALID_ACCOUNT_NAME]: '',
  [ErrorType.ACCOUNT_NAME_EXISTS]:
    'Wallet with same account name already exists',
  [ErrorType.JSON_KEY_EXISTS]: 'A wallet with the same key already exists',
  [ErrorType.NODE_INITIALIZATION_FAILED]:
    'Node initialization failed. Please restart the Koii Node',
  [ErrorType.TASK_START]: 'Task failed to start',
  [ErrorType.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later',
  [ErrorType.PARTIAL_CLAIM_FAILURE]:
    'Not all rewards were claimed successfully, please try again',
  [ErrorType.FETCHING_NEXT_REWARD_FAILED]: 'Failed to fetch the next reward.',
  [ErrorType.INVALID_SCHEDULE_SESSION_TIME_RANGE]:
    'Invalid time range. Start time must be before stop time.',
  [ErrorType.SCHEDULE_SAME_START_STOP_TIMES]:
    'Start time needs to be different from stop time.',
  [ErrorType.SCHEDULE_OVERLAP]: 'This session overlaps an existing one.',
  [ErrorType.SCHEDULE_NO_SELECTED_DAYS]: 'Please select session days.',
  [ErrorType.INVALID_WALLET_ADDRESS]: 'Please use a valid wallet address',
  [ErrorType.FETCH_ACCOUNT_BALANCE]: 'Could not fetch the account balance',
  [ErrorType.ACCOUNT_NOT_FOUND]: 'Account not found',
  [ErrorType.UNSTAKE_UNAVAILABLE]:
    'This task is still cooling down, please wait for 3 rounds and try again',
  [ErrorType.RPC_STATUS_FETCH_FAILED]:
    'There was an error fetching the RPC status',
  [ErrorType.TOKEN_TRANSFER_FAILED]:
    'There was an error during the token transfer. Please try again',
  [ErrorType.INSUFFICIENT_FUNDS]:
    'Insufficient balance to cover transaction fees',
  [ErrorType.KPL_TOKEN_TRANSFER_FAILED]:
    'There was an error during the token transfer. Please try again',
};

export function parseErrorMessage(errorMessage: string): {
  errorCode: string | null;
  htmlContent: string | null;
} {
  // Regular expression to find the error code
  const errorCodeRegex = /Error: (\d{3}) Too Many Requests/;
  // Regular expression to find the HTML content
  const htmlContentRegex = /(<!DOCTYPE html>[\s\S]*<\/html>)/;

  // Extracting the error code
  const errorCodeMatch = errorMessage.match(errorCodeRegex);
  const errorCode = errorCodeMatch ? errorCodeMatch[1] : null;

  // Extracting the HTML content
  const htmlContentMatch = errorMessage.match(htmlContentRegex);
  const htmlContent = htmlContentMatch ? htmlContentMatch[1] : null;

  return { errorCode, htmlContent };
}
