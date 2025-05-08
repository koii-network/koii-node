import React, { ChangeEvent, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface TimeSelectProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  onChange: (value: string) => void;
  defaultValue: string;
  min: number;
  max: number;
  hasError?: boolean;
  validationPattern?: string;
}

export function TimeInput({
  onChange,
  defaultValue,
  name,
  hasError,
  validationPattern,
  max,
  min,
  ...props
}: TimeSelectProps) {
  const inputClasses = twMerge(
    'text-sm leading-4 bg-purple-light-transparent w-[48px] h-9 py-2 text-center rounded-md border-2 border-transparent',
    hasError && 'border-finnieRed focus:border-finnieRed'
  );

  const [value, setValue] = useState(defaultValue);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.toString();

    let formattedValue = rawValue.replace(/[^\d.-]+/g, '').substring(0, 2);

    // Ensure the value is within the acceptable range
    const numericValue = parseInt(formattedValue, 10);
    if (numericValue < min) formattedValue = min.toString();
    if (numericValue > max) formattedValue = max.toString();

    setValue(formattedValue);
    onChange(formattedValue);
  };

  return (
    <input
      id={name}
      className={inputClasses}
      placeholder="00"
      onChange={onInputChange}
      value={value}
      name={name}
      min={min}
      max={max}
      pattern={validationPattern}
      {...props}
    />
  );
}
