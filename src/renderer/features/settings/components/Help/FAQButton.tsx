import React from 'react';

import { Button } from 'renderer/components/ui';
import { openBrowserWindow } from 'renderer/services';

export function FAQButton() {
  const handleOpenFAQWindow = () =>
    openBrowserWindow('https://docs.koii.network/koii/faq');

  return (
    <Button
      label="Go to FAQ"
      onClick={handleOpenFAQWindow}
      className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[200px] h-9 self-end mt-2"
    />
  );
}
