import React, { memo, useState, ChangeEventHandler } from 'react';

type PropsType = {
  disabled?: boolean;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
};

function KoiiInput({ disabled, onInputChange }: PropsType) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
    onInputChange(e);
  };

  return (
    <div className="w-80 h-[46px] outline-none bg-gray-200 border-b-finnieBlue border-2 text-4xl text-right flex justify-between items-center inner focus-within:bg-white">
      <input
        className="w-full text-right bg-gray-200 focus:bg-white focus:border-none focus:outline-none pl-2"
        pattern="[0-9]+"
        type="number"
        value={inputValue}
        disabled={disabled}
        onChange={handleInputChange}
        placeholder="0"
      />
      <div className="p-2">KOII</div>
    </div>
  );
}

export default memo(KoiiInput);
