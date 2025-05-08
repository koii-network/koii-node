import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import React from 'react';

type PropsType = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
  disabled?: boolean;
};

export function CTAButton({ onClick, label, disabled }: PropsType) {
  return (
    <Button
      disabled={disabled}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.SM}
      onClick={onClick}
      label={label}
    />
  );
}
