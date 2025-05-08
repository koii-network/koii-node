import React, { useEffect } from 'react';

import { downloadAppUpdate } from 'renderer/services';

import { useNotificationActions } from '../../useNotificationStore';

import { CTAButton } from './CTAButton';

export function AppUpdateButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const { markAsRead } = useNotificationActions();

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isDownloaded, setIsDownloaded] = React.useState(false);

  useEffect(() => {
    const destroy = window.main.onAppDownloaded(() => {
      setIsDownloading(() => false);
      setIsDownloaded(() => true);

      setTimeout(() => {
        markAsRead(notificationId);
      }, 5000);
    });

    return () => {
      destroy();
    };
  }, [isDownloaded, markAsRead, notificationId]);

  const handleUpdateDownload = () => {
    setIsDownloading(true);
    downloadAppUpdate().catch((err) => {
      console.error(err);
    });
  };

  const getLabel = () => {
    if (isDownloading) {
      return 'Downloading...';
    }

    if (isDownloaded) {
      return 'Update downloaded!';
    }

    return 'Update Now';
  };

  return (
    <CTAButton
      disabled={isDownloading || isDownloaded}
      label={getLabel()}
      onClick={() => {
        handleUpdateDownload();
      }}
    />
  );
}
