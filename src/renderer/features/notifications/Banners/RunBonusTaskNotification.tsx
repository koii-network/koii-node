/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BONUS_TASK_NAME } from 'config/node';
import { AppRoute } from 'renderer/types/routes';

import { BackButtonSlotType, NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

import { NotificationDisplayBanner } from './components/NotificationDisplayBanner';

const BONUS_TASK_EVENT = 'BONUS_TASK_CLICK';

export const sleep = (ms: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

export function RunBonusTaskNotification({
  notification,
  BackButtonSlot,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
}) {
  const { markAsRead } = useNotificationActions();

  const version = notification.metadata?.version as number;

  const handleClose = () => {
    markAsRead(notification.id);
  };

  const location = useLocation();
  const navigate = useNavigate();

  const handleRunBonusTask = async () => {
    if (location.pathname !== AppRoute.AddTask) {
      navigate(AppRoute.AddTask);
      await sleep(1000);
    }
    window.dispatchEvent(
      new CustomEvent(BONUS_TASK_EVENT, {
        detail: { taskName: BONUS_TASK_NAME },
      })
    );
    handleClose();
  };

  const text =
    version === 1 ? (
      <div className="text-left">
        <span className="text-white text-base font-bold font-['Sora'] leading-tight">
          You power
        </span>
        <span className="text-white text-base font-normal font-['Sora'] leading-tight">
          {' '}
          the network, We power{' '}
        </span>
        <span className="text-white text-base font-bold font-['Sora'] leading-tight">
          your rewards!
        </span>
      </div>
    ) : version === 2 ? (
      "Don't miss out! Run the Bonus Task to earn extra rewards on the tasks you're already running!"
    ) : (
      "Last chance! Run the Bonus Task to earn extra rewards on the tasks you're already running!"
    );

  return (
    <NotificationDisplayBanner
      onClose={handleClose}
      notification={notification}
      messageSlot={<div className="">{text}</div>}
      actionButtonSlot={
        <div className="flex items-center gap-6 w-max mr-2">
          <button
            onClick={handleRunBonusTask}
            className="px-6 py-2 bg-white shadow-[0_0_3px_3px_rgba(255,215,0,0.5)] hover:shadow-[0_0_8px_8px_rgba(255,215,0,0.5)] rounded-md text-[#2B1C50] font-bold hover:brightness-110 transition-all duration-300"
          >
            Run Bonus Task
          </button>
        </div>
      }
      BackButtonSlot={BackButtonSlot}
    />
  );
}

export { BONUS_TASK_EVENT };
