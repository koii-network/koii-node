import React, { ChangeEvent, useState } from 'react';

import { ErrorMessage } from 'renderer/components/ui/ErrorMessage';
import { isValidWalletAddress } from 'renderer/utils';

type DestinationWalletInputProps = {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
};

export function WalletAddressInput({
  value,
  onChange,
}: DestinationWalletInputProps) {
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const addressIsValid = await isValidWalletAddress(newValue);
    setIsValid(addressIsValid);
    onChange(newValue, addressIsValid);
  };

  return (
    <div className="flex flex-col mb-2 w-80">
      <label htmlFor="destinationWallet" className="mb-0.5 text-left">
        Destination Wallet
      </label>
      <div
        className={`flex items-center justify-center px-4 py-2 space-x-1 text-white duration-500 rounded-md w-80 bg-finnieBlue-light-tertiary transition-width ${
          !isValid && value ? 'ring-1 ring-finnieRed' : ''
        }`}
      >
        <input
          id="destinationWallet"
          className="w-full h-10 text-md text-center text-white bg-transparent outline-none max-w-[246px]"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Enter Destination wallet address"
        />
      </div>
      {!isValid && value ? (
        <ErrorMessage
          error="Invalid wallet address"
          className="h-5 py-0 pt-1"
        />
      ) : (
        <div className="h-5" />
      )}
    </div>
  );
}
