import React from 'react';

interface Props {
  id: string;
  isChecked: boolean;
  onSwitch: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function Switch({
  id,
  isChecked,
  onSwitch,
  className = '',
  disabled,
  label,
}: Props) {
  const dotClasses = `absolute left-0.5 top-0.5 bg-purple-3 w-5 h-5 rounded-full transition peer-checked:transform peer-checked:translate-x-full ${className}s ${
    disabled ? 'cursor-not-allowed' : ''
  }`;
  const switchClasses = `block ${
    (isChecked && 'bg-finnieEmerald-light') || 'bg-finnieGray-light'
  } w-11 h-6 rounded-full ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } transition}`;

  return (
    <label
      htmlFor={id}
      className="flex items-center justify-start cursor-pointer"
    >
      {!!label && <span className="text-base text-white mr-4">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={isChecked}
          onChange={onSwitch}
          disabled={disabled}
        />
        <div className={switchClasses} />
        <div className={dotClasses} />
      </div>
    </label>
  );
}
