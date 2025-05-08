import { CheckSuccessLine, CloseLine } from '@_koii/koii-styleguide';
import React from 'react';
import toast from 'react-hot-toast';

import { TimeFormat } from 'models';

import { getTimeUntilScheduleStarts } from './getTimeUntilScheduleStarts';

export const renderTimeToStartSessionToast = (
  startTime: TimeFormat,
  days: number[]
) => {
  const timeUntilScheduleStart = getTimeUntilScheduleStarts(
    startTime,
    days || []
  );

  toast.success(
    `This session will begin in ${timeUntilScheduleStart}.`,

    {
      duration: 4500,
      icon: <CheckSuccessLine className="w-5 h-5" />,
      style: {
        backgroundColor: '#BEF0ED',
        paddingRight: 0,
        maxWidth: '100%',
      },
    }
  );
};

export const renderErrorToast = (errorMessage: string) => {
  toast.error(errorMessage, {
    duration: 4500,
    icon: <CloseLine className="w-5 h-5" />,
    style: {
      backgroundColor: '#FFA6A6',
      paddingRight: 0,
      maxWidth: '100%',
    },
  });
};
