import React from 'react';

import { Button } from 'renderer/components/ui';
import { openBrowserWindow } from 'renderer/services';

export function BugReport() {
  const redirectToReportForm = () =>
    openBrowserWindow(
      'https://docs.google.com/forms/d/e/1FAIpQLSe5_gRJ4hHOvIF_AHHK1TqFz2J3DzqWhkcm7AyAicPkQyTrrA/viewform'
    );

  return (
    <Button
      label="Submit the Bug Form"
      onClick={redirectToReportForm}
      className="font-semibold bg-white text-finnieBlue-light text-[14px] leading-[14px] min-w-[200px] h-9 self-end mt-2"
    />
  );
}
