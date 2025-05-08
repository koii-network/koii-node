import React, { ChangeEvent, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  className?: string;
  placeholder?: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  className,
  placeholder,
}: InputFieldProps): JSX.Element {
  const [isPristine, setIsPristine] = useState(true);
  const inputWrapperClasses = twMerge('flex flex-col', className);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isPristine) {
      setIsPristine(false);
    }
    onChange(e);
  };

  return (
    <div className={inputWrapperClasses}>
      <label className="leading-6 w-full" htmlFor={name}>
        {label}
      </label>
      <input
        name={name}
        placeholder={placeholder}
        className="w-full border bg-white border-white rounded-finnie-small bg-transparent text-finnieBlue-dark-secondary p-1 shadow-sm"
        value={value}
        onChange={handleChange}
      />
      <div className="text-xs text-left text-finnieRed h-4 min-h-4 pt-1">
        {!isPristine && error}
      </div>
    </div>
  );
}

export default InputField;
