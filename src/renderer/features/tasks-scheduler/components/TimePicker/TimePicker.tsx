import { CloseLine } from '@_koii/koii-styleguide';
import { format, parse } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';

import { TimeFormat } from 'models';

import { AMPM, SelectAmPm } from './AmPmSelect';
import { TimeInput } from './TimeInput';

interface TimePickerProps {
  label: string;
  onTimeChange: (value: TimeFormat) => void;
  defaultValue?: TimeFormat;
  onHide?: () => void;
  autofocus?: boolean;
}

const formatHour = (hour: number): string => {
  const ampmHour = hour >= 12 ? hour - 12 : hour;
  const ampmHourStr = ampmHour.toString();
  return ampmHourStr.length === 1 ? `0${ampmHourStr}` : ampmHourStr;
};

export function TimePicker({
  label,
  onTimeChange,
  defaultValue,
  onHide,
  autofocus,
}: TimePickerProps) {
  const defaultHour = defaultValue ? defaultValue.split(':')[0] : '00';
  const defaultMinute = defaultValue ? defaultValue.split(':')[1] : '00';

  const defaultHourNum = parseInt(defaultHour, 10);

  const defaultAmPm: AMPM =
    defaultHourNum < 12 || defaultHourNum === 0 ? AMPM.AM : AMPM.PM;

  const [hour, setHour] = useState(formatHour(defaultHourNum));
  const [minute, setMinute] = useState(defaultMinute);
  const [amPm, setAmPm] = useState(defaultAmPm);

  const prevTimeRef = useRef<string | null>(null);

  const errorMessage = 'Please enter a valid time';

  const [hasError, setHasError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(true);

    const adjustedHour = hour === '00' ? '12' : hour;
    const timeString = `${adjustedHour}:${minute} ${amPm}`;
    const parsedDate = parse(timeString, 'hh:mm a', new Date());

    // Check if parsedDate is a valid Date object
    if (!Number.isNaN(parsedDate.getTime())) {
      const formattedTime = format(parsedDate, 'HH:mm:ss') as TimeFormat;
      const prevTime = prevTimeRef.current;

      if (prevTime && prevTime !== formattedTime) {
        // Call onTimeChange only if the time values are different

        onTimeChange(formattedTime);
      }

      prevTimeRef.current = formattedTime;
      setHasError(false);
    } else {
      setHasError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, amPm]);

  return (
    <div className="text-white w-[180px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {onHide ? (
          <CloseLine
            tabIndex={0}
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={onHide}
          />
        ) : (
          <span />
        )}
      </div>
      <div>
        <div className="flex gap-4 mt-2 mb-1">
          <div className="flex items-center gap-[4px]">
            <TimeInput
              name="hour"
              onChange={setHour}
              defaultValue={hour}
              onFocus={(e) => e.target.select()}
              min={0}
              max={12}
              hasError={hasError && isDirty}
              // allow values between 00 and 12
              validationPattern="^(0[0-9]|1[0-2])$"
            />
            <span>:</span>
            <TimeInput
              name="minute"
              onChange={setMinute}
              defaultValue={defaultMinute}
              onFocus={(e) => e.target.select()}
              min={0}
              max={59}
              hasError={hasError && isDirty}
              // allow values between 00 and 59
              validationPattern="^([0-5]?[0-9])$"
              autoFocus={autofocus}
            />
          </div>
          <SelectAmPm
            defaultValue={defaultAmPm}
            onChange={setAmPm}
            hasError={hasError && isDirty}
          />
        </div>
        <div className="h-0 pt-1 text-xs text-finnieRed">
          {hasError && isDirty && errorMessage}
        </div>
      </div>
    </div>
  );
}
