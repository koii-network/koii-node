import React from 'react';

import { Button } from 'renderer/components/ui';
import { openBrowserWindow } from 'renderer/services';

export function DiscordButton({ onClick }: { onClick?: () => void }) {
  const handleOpenDiscordServerWindow = () => {
    openBrowserWindow('https://discord.gg/koii-network');
    if (onClick) {
      onClick(); // Call the passed onClick function
    }
  };

  return (
    <Button
      label="Report a bug"
      onClick={handleOpenDiscordServerWindow}
      className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[200px] h-9 self-end mt-2"
    />
  );
}
