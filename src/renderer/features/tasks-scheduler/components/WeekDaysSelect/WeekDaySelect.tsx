import React, { useCallback, useState } from 'react';

import { WeekDay } from './WeekDay';

const weekDays = [
  { label: 'M', value: 1, name: 'Monday' },
  { label: 'T', value: 2, name: 'Tuesday' },
  { label: 'W', value: 3, name: 'Wednesday' },
  { label: 'T', value: 4, name: 'Thursday' },
  { label: 'F', value: 5, name: 'Friday' },
  { label: 'S', value: 6, name: 'Saturday' },
  { label: 'S', value: 0, name: 'Sunday' },
];

type PropsType = {
  sessionId: string;
  onSelectedDaysChange: (value: number[]) => void;
  defaultValue?: number[];
};

export function WeekDaySelect({
  sessionId,
  onSelectedDaysChange,
  defaultValue = [],
}: PropsType) {
  const [selectedDays, setSelectedDays] = useState<number[]>(defaultValue);

  const handleSelect = useCallback(
    (value: number, checked: boolean) => {
      const newSelectedDays: number[] = checked
        ? [...selectedDays, value].sort()
        : selectedDays.filter((day) => day !== value);

      setSelectedDays(newSelectedDays);
      if (onSelectedDaysChange) {
        onSelectedDaysChange(newSelectedDays);
      }
    },
    [onSelectedDaysChange, selectedDays]
  );

  return (
    <div className="flex items-center h-full gap-5">
      {weekDays.map((day) => {
        return (
          <WeekDay
            defaultCheckedValue={selectedDays.includes(day.value)}
            uniqueId={sessionId}
            key={`${sessionId}-${day.value}`}
            label={day.label}
            value={day.value}
            onSelect={handleSelect}
          />
        );
      })}
    </div>
  );
}
