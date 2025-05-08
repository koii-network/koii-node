import React from 'react';
import { toast } from 'react-hot-toast';
import { useMutation } from 'react-query';

import { LoadingSpinner } from 'renderer/components/ui/LoadingSpinner';
import { redeemTokensInNewNetwork } from 'renderer/services';

export function ForceRedeemMigrationTokens() {
  const { mutate: redeemTokens, isLoading } = useMutation(
    redeemTokensInNewNetwork,
    {
      onSuccess: (tokens) => {
        const toastMessage = tokens
          ? `We found some! Adding ${tokens} KOII to your balance.`
          : 'All your tokens have been claimed already.';
        toast.success(toastMessage);
      },
    }
  );

  const handleForceRedeem = () => {
    redeemTokens();
  };

  return (
    <div className="text-sm mb-2 flex gap-3">
      <span>Got all your tokens after the latest network migration?</span>
      {isLoading ? (
        <LoadingSpinner className="h-8 w-8 -mt-2" />
      ) : (
        <span>
          <button
            onClick={handleForceRedeem}
            className="underline text-finnieEmerald-light underline-offset-2 font-semibold"
          >
            Check Now
          </button>
        </span>
      )}
    </div>
  );
}
