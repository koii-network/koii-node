import { motion } from 'framer-motion';
import React, { MutableRefObject, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import CloseSvg from 'assets/svgs/colored-close.svg';
import DesktopSvg from 'assets/svgs/destop.svg';
import { useOnClickOutside } from 'renderer/features/common/hooks';
import { AppRoute } from 'renderer/types/routes';

import { NotificationType } from '../types';
import { useNotificationActions } from '../useNotificationStore';

const variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.2 } },
};

export function FirstTaskRunningNotification({
  notification,
}: {
  notification: NotificationType;
}) {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationActions();

  const close = () => markAsRead(notification.id);
  const onCTAClick = () => {
    navigate(AppRoute.AddTask);
    close();
  };
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref as MutableRefObject<HTMLDivElement>, close);

  return (
    <motion.div
      className="absolute right-[53px] bottom-[43px] text-white z-[100] bg-blue-1 p-3 rounded-lg"
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <div className="flex">
        <DesktopSvg />
        <div className="ml-[30px] max-w-[430px]">
          <p className="text-[32px] leading-[40px]">
            Congrats! You&apos;re running your first task!
          </p>
          <p className="mt-1 text-base leading-8">
            Head over to{' '}
            <button
              className="underline cursor-pointer text-finnieEmerald-light"
              onClick={onCTAClick}
            >
              Add Tasks
            </button>{' '}
            to check out the rest of tasks available!{' '}
          </p>
        </div>
        <div>
          <button className="w-auto h-auto" onClick={() => close()}>
            <CloseSvg />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
