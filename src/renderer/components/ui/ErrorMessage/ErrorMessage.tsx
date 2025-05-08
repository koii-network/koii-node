import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ErrorContext, getErrorToDisplay } from 'renderer/utils';

interface PropsType {
  error: Error | string | null;
  context?: ErrorContext;
  className?: string;
}

export function ErrorMessage({ error, context, className = '' }: PropsType) {
  if (!error) {
    return null;
  }

  const errorMessage = getErrorToDisplay(error, context);
  const classNames = twMerge('py-3 text-sm text-finnieRed', className);

  return <div className={classNames}>{errorMessage}.</div>;
}
