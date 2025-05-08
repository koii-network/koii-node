import { HideEyeLine, Icon, ViewShowLine } from '@_koii/koii-styleguide';
import React, { memo, useEffect, useRef, useState } from 'react';
import PinInput from 'react-pin-input';

import { Button } from '../ui/Button';

type PropsType = Readonly<{
  onChange?: (pin: string) => void;
  onComplete?: (pin: string) => void;
  initialValue?: string | number;
  showHideButton?: boolean;
  showHideIconSize?: number;
  focus?: boolean;
  className?: string;
}>;

function PinInputComponent({
  onComplete,
  onChange,
  initialValue,
  showHideButton = true,
  showHideIconSize = 20,
  focus,
}: PropsType) {
  const [showPinInput, setShowPinInput] = useState(false);
  const pinInputRef = useRef<PinInput>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if the target is an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (focus) {
        // Focus the PinInput when a key is pressed
        pinInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focus]);

  const ShowOrHideInputIcon = showPinInput ? ViewShowLine : HideEyeLine;

  return (
    <div className="z-50 flex items-center">
      <PinInput
        ref={pinInputRef}
        length={6}
        initialValue={initialValue}
        secret={!showPinInput}
        onChange={onChange}
        type="numeric"
        inputMode="number"
        onComplete={onComplete}
        autoSelect
        regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
        ariaLabel="pin-input"
      />
      {showHideButton && (
        <Button
          className="bg-transparent rounded-[50%] w-[24px] h-[24px] cursor-pointer"
          icon={
            <Icon
              size={showHideIconSize}
              source={ShowOrHideInputIcon}
              className="text-white"
            /> // not sure
          }
          onClick={() => setShowPinInput(!showPinInput)}
        />
      )}
    </div>
  );
}

export default memo(PinInputComponent);
