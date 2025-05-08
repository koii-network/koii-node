import { Button } from '@_koii/koii-styleguide';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { NotificationStatusIndicator } from 'renderer/features/notifications/NotificationsCenter/components/NotificationStatusIndicator';
import { QueryKeys } from 'renderer/services';
import {
  checkUPnPbinary,
  fetchAndSaveUPnPBinary,
} from 'renderer/services/api/upnp';

import { Spacer } from '../Spacer';

export function UpnpBinaries() {
  const {
    data: isBinaryExists,
    isLoading: isCheckingBinary,
    refetch,
  } = useQuery([QueryKeys.UpnpBinaryExists], () => checkUPnPbinary(), {});
  const [error, setError] = useState('');

  // Using useMutation to handle the fetchAndSaveUPnPBinary operation
  const mutation = useMutation(fetchAndSaveUPnPBinary, {
    onSuccess: () => {
      refetch();
      setError('');
    },
    onError: (error) => {
      console.log(error);
      setError((error as { message: string }).message);
    },
  });

  return (
    <div>
      <div className="mb-2 text-sm">
        UPnP binary is required for networking features. The binary is fetched
        automatically, but in the case of missing files, you can fetch it
        manually here.
      </div>

      <Spacer size="md" />

      <div className="flex items-center gap-4">
        <Button
          onClick={() => mutation.mutate()} // Trigger the mutation when the button is clicked
          label="Download binary"
          disabled={mutation.isLoading}
        />

        {isCheckingBinary ? (
          'Checking binary...'
        ) : (
          <div>
            {isBinaryExists ? (
              <div className="flex items-center gap-1">
                <NotificationStatusIndicator
                  notificationType="SUCCESS"
                  isRead={false}
                />
                <span>Executable already downloaded.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <NotificationStatusIndicator
                  notificationType="ERROR"
                  isRead={false}
                />
                <span>Executable is missing.</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="py-4 text-sm text-finnieRed">{error}</div>
    </div>
  );
}
