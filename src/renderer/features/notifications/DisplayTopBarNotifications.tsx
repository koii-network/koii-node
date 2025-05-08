import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import CloseIcon from 'assets/svgs/close.svg';
import { AppRoute } from 'renderer/types/routes';

import { useNotificationComponent } from './hooks/useNotificationComponent';
import { BackButtonSlotType, NotificationType } from './types';
import { useNotificationActions } from './useNotificationStore';

type PropsType = {
  topBarNotifications: NotificationType[];
  BackButtonSlot: BackButtonSlotType;
  os: 'windows' | 'macos' | 'linux' | null;
};

export function DisplayTopBarNotifications({
  topBarNotifications,
  BackButtonSlot,
  os,
}: PropsType) {
  const navigate = useNavigate();
  const { markAsDismissed } = useNotificationActions();
  const [maxNotifications, setMaxNotifications] = React.useState(3);

  React.useEffect(() => {
    const updateMaxNotifications = () => {
      const height = window.innerHeight;
      if (height <= 860) {
        setMaxNotifications(3);
      } else {
        const extraNotifications = Math.floor((height - 860) / 200);
        setMaxNotifications(4 + extraNotifications);
      }
    };

    updateMaxNotifications();

    window.addEventListener('resize', updateMaxNotifications);

    return () => window.removeEventListener('resize', updateMaxNotifications);
  }, []);

  const markAllNotificationsAsRead = async () => {
    try {
      for (const notification of topBarNotifications) {
        await markAsDismissed(notification.id);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const redirectToNotificationsCenter = () => navigate(AppRoute.Notifications);
  const onClickSeeAll = async () => {
    await markAllNotificationsAsRead();
    redirectToNotificationsCenter();
  };

  const onClickClose = () => {
    markAllNotificationsAsRead();
  };

  const uniqueNotifications = topBarNotifications.filter(
    (notification, index, self) =>
      index === self.findIndex((n) => n.id === notification.id)
  );

  const latestNotifications = uniqueNotifications.slice(-maxNotifications);
  const hasMoreNotifications = uniqueNotifications.length > maxNotifications;

  const stylesBasedOnOs =
    os === 'macos'
      ? 'bg-white/[0.06] backdrop-blur-[40px]'
      : 'bg-finnieBlue-light-secondary !shadow-[0_0_30px_rgba(var(--color-shade-rgb),0.9)]';

  return (
    <motion.div
      className={`rounded-md z-[60] w-fit absolute top-[62px] mr-2 mt-[3.80px] right-0 ${stylesBasedOnOs} mb-1 transition-all duration-300 ease-in-out !shadow-[0_0_30px_rgba(var(--color-shade-rgb),0.4)]`}
      initial={{
        opacity: 0,
        y: -20,
        scale: 0.95,
        rotateX: 10,
        transformPerspective: 1200,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
          type: 'tween',
          duration: 0.3,
          ease: [0.2, 0.65, 0.3, 0.9],
          scale: {
            duration: 0.25,
            ease: [0.25, 1.2, 0.5, 1],
          },
          opacity: {
            duration: 0.15,
          },
        },
      }}
      exit={{
        opacity: 0,
        y: -30,
        scale: 0.95,
        rotateX: 15,
        transition: {
          duration: 0.3,
          ease: [0.43, 0, 0.23, 1],
        },
      }}
      style={{
        transformStyle: 'flat',
        perspective: '1200px',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="transform-style-flat overflow-hidden">
        <div className="text-white font-semibold h-[64px] border-b border-white/20 flex items-center justify-between pl-4">
          <span className="select-none">Your notifications</span>{' '}
          <div className="flex gap-x-2">
            <button
              className="hover:underline font-medium text-green-2 select-none"
              onClick={onClickSeeAll}
            >
              See all
            </button>
            <button className="hover:underline" onClick={onClickClose}>
              <CloseIcon className="w-12 h-12 hover:rotate-90 transition-all duration-300 ease-in-out -mt-px" />
            </button>
          </div>
        </div>
        {latestNotifications.map((notification) => {
          return (
            <NotificationDisplay
              notification={notification}
              key={notification.id}
              BackButtonSlot={BackButtonSlot}
              markAsDismissed={markAsDismissed}
            />
          );
        })}
        {hasMoreNotifications && (
          <div className="select-none text-white/70 text-sm py-2 px-4 text-center border-t border-white/20">
            <button
              className="hover:underline hover:text-green-2"
              onClick={onClickSeeAll}
            >
              + {uniqueNotifications.length - maxNotifications} more
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NotificationDisplay({
  notification,
  BackButtonSlot,
  markAsDismissed,
}: {
  notification: NotificationType;
  BackButtonSlot: BackButtonSlotType;
  markAsDismissed: (id: string) => void;
}) {
  const Component = useNotificationComponent({ notification, BackButtonSlot });

  if (!Component) return null;

  return (
    // <div >
    <motion.div
      className="relative border-t border-white/20 !text-sm my-auto overflow-hidden perspective-[1200px] transform-style-preserve-3d"
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotateZ: 2,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateZ: 0,
        transition: {
          duration: 0.4,
          type: 'spring',
          stiffness: 280,
          damping: 15,
          bounce: 0.4,
          velocity: 1,
          restDelta: 0.001,
        },
      }}
      exit={{
        opacity: 0,
        y: -30,
        scale: 0.9,
        rotateZ: -2,
        transition: {
          duration: 0.25,
        },
      }}
    >
      <button
        className="absolute top-2 right-2 text-xs text-white/50 hover:underline z-50"
        onClick={() => markAsDismissed(notification.id)}
      >
        <CloseIcon className="w-9 h-9 hover:rotate-90 transition-all duration-300 ease-in-out" />
      </button>
      {Component}
      <div className="absolute bottom-3 right-4 text-xs text-white/50 pointer-events-none">
        {formatRelativeTime(notification.date)}
      </div>
    </motion.div>
  );
}

// Helper function to format the date as a relative time string
function formatRelativeTime(date: number | string | Date): string {
  const now = new Date();
  let notificationDate: Date;

  if (typeof date === 'number') {
    notificationDate = new Date(date);
  } else if (typeof date === 'string') {
    notificationDate = new Date(date);
  } else {
    notificationDate = date;
  }

  const diffInSeconds = Math.floor(
    (now.getTime() - notificationDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
}
