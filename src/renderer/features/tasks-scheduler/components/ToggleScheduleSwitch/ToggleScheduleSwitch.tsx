import { CheckSuccessLine } from '@_koii/koii-styleguide';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { Switch } from 'renderer/components/ui/Switch';

import { useUpdateSession } from '../../hooks';

type PropsType = {
  sessionId: string;
  disabled?: boolean;
  value?: boolean;
};

export function ToggleScheduleSwitch({
  sessionId,
  disabled,
  value,
}: PropsType) {
  const [isChecked, setIsChecked] = useState<boolean | null | undefined>(value);

  const updateSessionMutation = useUpdateSession({
    onSessionUpdateError(error) {
      toast.error(error, {
        duration: 4500,
        icon: <CheckSuccessLine className="w-5 h-5" />,
        style: {
          backgroundColor: '#BEF0ED',
          paddingRight: 0,
          maxWidth: '100%',
        },
      });
    },
    onSessionUpdateSuccess(data) {
      toast.success(
        data.variables.isEnabled ? 'Session enabled.' : 'Session disabled.',
        {
          duration: 4500,
          icon: <CheckSuccessLine className="w-5 h-5" />,
          style: {
            backgroundColor: '#BEF0ED',
            paddingRight: 0,
            maxWidth: '100%',
          },
        }
      );
    },
  });

  const onSwitch = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e ? e.target.checked : false;
    setIsChecked(newValue);

    await updateSessionMutation.mutateAsync({
      id: sessionId,
      isEnabled: newValue,
    });
  };

  return (
    <Switch
      id={`${sessionId}onoff`}
      isChecked={!!isChecked}
      onSwitch={onSwitch}
      disabled={disabled}
    />
  );
}
