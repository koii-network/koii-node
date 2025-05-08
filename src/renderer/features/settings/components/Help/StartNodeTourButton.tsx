import React from 'react';

import { Button } from 'renderer/components/ui';

export function StartNodeTourButton() {
  const startNodeTour = () => {
    console.log('Start Node Tour');
  };

  return (
    <Button
      label="Start Node Tour"
      onClick={startNodeTour}
      className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[200px] h-9 self-end mt-2"
    />
  );
}
