// UpdateAvailableNotification

import React, { useEffect } from 'react';

import { downloadAppUpdate } from 'renderer/services';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function UpdateAvailableNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { markAsRead } = useNotificationActions();

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isDownloaded, setIsDownloaded] = React.useState(false);

  useEffect(() => {
    const destroy = window.main.onAppDownloaded(() => {
      setIsDownloading(() => false);
      setIsDownloaded(() => true);

      setTimeout(() => {
        markAsRead(notification.id);
      }, 5000);
    });

    return () => {
      destroy();
    };
  }, [isDownloaded, markAsRead, notification.id]);

  const handleUpdateDownload = () => {
    setIsDownloading(true);
    downloadAppUpdate().catch((err) => {
      console.error(err);
    });
  };

  const getContent = () => {
    if (isDownloading) {
      return 'New version is downloading...';
    }

    if (isDownloaded) {
      return 'New version is ready to install!';
    }

    return (
      <button
        className="text-white bg-transparent text-white font-semibold w-max px-4 py-2 rounded-[4px] border-white border-2  hover:bg-[rgb(243,243,247)]/[0.1] hover:shadow-xl transition-all duration-300 ease-in-out"
        onClick={handleUpdateDownload}
      >
        Update Now
      </button>
    );
  };

  const showBannerMainContent = !isDownloading && !isDownloaded;

  return (
    <NotificationDisplayBanner
      notification={notification}
      messageSlot={
        <div className="">
          {showBannerMainContent &&
            'A new version of the node is ready for you!'}
        </div>
      }
      actionButtonSlot={getContent()}
      BackButtonSlot={BackButtonSlot}
    />
  );
}
