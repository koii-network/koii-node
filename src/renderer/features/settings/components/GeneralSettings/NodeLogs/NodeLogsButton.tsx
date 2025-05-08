import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import React from 'react';

export function NodeLogsButton() {
  const handleClick = () => {
    console.log('open');
    window.main.openNodeLogfileFolder();
  };

  return (
    <Button
      onClick={handleClick}
      variant={ButtonVariant.Secondary}
      size={ButtonSize.SM}
      label="Get Node Logs"
      buttonClassesOverrides="!border-white !text-white text-sm px-6 py-6"
    />
  );
}
