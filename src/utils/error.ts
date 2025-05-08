import { DetailedError, ErrorType, NetworkErrors } from 'models';

// Due to Electron automatically serializing any error thrown from the BE, we stringify our custom error object and parse it later to retrieve it (see `getErrorToDisplay`)
export const throwDetailedError = ({ detailed, type }: DetailedError) => {
  throw new Error(
    JSON.stringify({
      detailed,
      type,
    })
  );
};

export const throwTransactionError = (e: any) => {
  const errorType = e.message
    .toLowerCase()
    .includes(NetworkErrors.TRANSACTION_TIMEOUT)
    ? ErrorType.TRANSACTION_TIMEOUT
    : e.message
        .toLowerCase()
        .includes(NetworkErrors.INSUFFICIENT_FUNDS_FOR_FEES)
    ? ErrorType.INSUFFICIENT_FUNDS_FOR_FEES
    : ErrorType.GENERIC;
  return throwDetailedError({
    detailed: e,
    type: errorType,
  });
};
