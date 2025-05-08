import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import React from 'react';

import { useUpdatePinModal } from 'renderer/features/common';

export function UpdatePin() {
  const { showModal } = useUpdatePinModal();
  const handlePinUpdate = () => {
    console.log('open');
    showModal();
  };

  return (
    <Button
      onClick={handlePinUpdate}
      variant={ButtonVariant.Secondary}
      size={ButtonSize.SM}
      label="Update Pin"
      buttonClassesOverrides="!border-white !text-white text-lg px-8 py-6 font-semibold"
    />
  );
}
