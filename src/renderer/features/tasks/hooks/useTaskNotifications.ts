import { useEffect } from 'react';

import { TaskNotificationPayloadType } from 'preload/apis/tasks/onTaskNotificationReceived';

export function useTaskNotifications({
  onTaskNotificationReceived,
}: {
  onTaskNotificationReceived: (payload: TaskNotificationPayloadType) => void;
}) {
  useEffect(() => {
    const destroy = window.main.onTaskNotificationReceived(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_, payload) => {
        console.log('Task notification received', payload);
        onTaskNotificationReceived(payload);
      }
    );

    return () => {
      destroy();
    };
  }, [onTaskNotificationReceived]);
}
