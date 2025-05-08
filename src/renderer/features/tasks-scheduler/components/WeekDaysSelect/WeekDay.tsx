import React, { useState } from 'react';

type PropsType = {
  uniqueId: string;
  label: string;
  value: number;
  defaultCheckedValue: boolean;
  onSelect: (value: number, checked: boolean) => void;
};

export function WeekDay({
  uniqueId,
  label,
  value,
  onSelect,
  defaultCheckedValue,
}: PropsType) {
  const id = `${label}${value}${uniqueId}`;
  const [isChecked, setIsChecked] = useState<boolean>(defaultCheckedValue);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsChecked(checked);
    onSelect(value, checked);
  };

  const checkedStyles = isChecked
    ? 'border-green-2 bg-finnieTeal-100 text-purple-3'
    : 'border-green-2';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <label
        htmlFor={id}
        className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 border-2 rounded-full ${checkedStyles}`}
      >
        <input
          type="checkbox"
          id={id}
          name={id}
          value={value}
          checked={isChecked}
          onChange={handleInputChange}
          className="absolute w-0 h-0 opacity-0"
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          className={`${isChecked ? 'block' : 'hidden'}`}
        >
          <path
            d="M3.76855 10.2615L8.4826 14.9755L17.9107 5.54743"
            stroke="#353570"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </label>

      <span className="text-center text-white ">{label}</span>
    </div>
  );
}
