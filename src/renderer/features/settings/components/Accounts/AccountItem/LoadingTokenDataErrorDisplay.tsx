import React from 'react';

import { ErrorMessage } from 'renderer/components/ui/ErrorMessage';

export type PropsType = {
  error: string;
};

export function LoadingTokenDataErrorDisplay({ error }: PropsType) {
  return (
    <div className="flex flex-row items-start justify-start gap-2 p-3 rounded-xl bg-purple-1 w-[75%] mt-3 bg-opacity-20">
      <ErrorMessage error={error} className="text-md" />
    </div>
  );
}
