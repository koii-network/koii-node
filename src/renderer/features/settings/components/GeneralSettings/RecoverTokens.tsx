/* eslint-disable react/no-unescaped-entities */
import { addDays, differenceInSeconds } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';

import { Button, ErrorMessage, LoadingSpinner } from 'renderer/components/ui';

import { useUserAppConfig } from '../../hooks';

export function RecoverTokens() {
  const handleRecoverTokens = async () => {
    const claimedAmount = await window.main.recoverLostTokens();
    return claimedAmount;
  };

  const { userConfig, handleSaveUserAppConfigAsync } = useUserAppConfig();

  const lastClaimDate = userConfig?.lastLostTokensClaimDate;

  const { mutate, isLoading, isSuccess, error } =
    useMutation(handleRecoverTokens);

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      if (lastClaimDate) {
        const nextClaimDate = addDays(new Date(lastClaimDate), 7);
        const currentDate = new Date();
        const secondsRemaining = differenceInSeconds(
          nextClaimDate,
          currentDate
        );

        if (secondsRemaining > 0) {
          const days = Math.floor(secondsRemaining / (60 * 60 * 24));
          const hours = Math.floor(
            (secondsRemaining % (60 * 60 * 24)) / (60 * 60)
          );
          const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
          const seconds = Math.floor(secondsRemaining % 60);

          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown('');
        }
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [lastClaimDate]);

  const isClaimDisabled = !!countdown;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm">
        <h1 className="mb-2 font-semibold">Lost some KOII? No worries.</h1>
        <p>
          Your tokens aren't lost, they're just on an adventure. Click to bring
          them back home.
        </p>
      </div>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <span className="w-64 h-14">
            <LoadingSpinner className="w-10 h-10 mx-auto" />
          </span>
        ) : (
          <Button
            label="Claim Now"
            onClick={() => mutate()}
            className="w-44 font-semibold h-10 bg-gray-primary text-purple-5"
            disabled={isLoading || isClaimDisabled}
            loading={isLoading}
          />
        )}

        {countdown && (
          <span className="text-sm text-gray-500">
            Next claim available in: {countdown}
          </span>
        )}
      </div>

      {isSuccess ? <SuccessMessage /> : null}
      {error ? (
        <ErrorMessage error={(error as any).message} className="text-sm" />
      ) : null}
    </div>
  );
}

export function SuccessMessage() {
  const message = 'You successfully recovered all of your tokens!';

  return <div className="text-sm text-finnieEmerald-light">{message}</div>;
}
