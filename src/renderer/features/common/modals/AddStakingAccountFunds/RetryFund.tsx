import { Button, WarningTriangleLine, Icon } from '@_koii/koii-styleguide';
import React from 'react';

type PropsType = {
  handleRetry: () => void;
};

export function RetryFund({ handleRetry }: PropsType) {
  return (
    <>
      <Icon
        source={WarningTriangleLine}
        className="my-5 text-white w-14 h-14"
      />

      <p>Whoops, something went wrong. Please try again.</p>

      <Button
        label="Retry Now"
        onClick={handleRetry}
        className="w-56 h-12 m-auto mb-2 font-semibold rounded-md bg-finnieGray-tertiary text-finnieBlue-light"
      />
    </>
  );
}
