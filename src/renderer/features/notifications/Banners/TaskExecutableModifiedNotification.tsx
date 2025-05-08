import React from 'react';

import { BackButtonSlotType, NotificationType } from '../types';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

export function TaskExecutableModifiedNotification({
  notification,
  BackButtonSlot,
  task,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
  task: {
    taskId: string;
    taskName: string;
  };
}) {
  return (
    <NotificationDisplayBanner
      variant="WARNING"
      notification={notification}
      messageSlot={
        <div className="max-w-[75%]">
          The executable file for the task
          <span className="font-bold">
            {' '}
            {task.taskName} ({task.taskId})
          </span>{' '}
          has been modified. Your task will be restarted.
        </div>
      }
      actionButtonSlot={null}
      BackButtonSlot={BackButtonSlot}
    />
  );
}
