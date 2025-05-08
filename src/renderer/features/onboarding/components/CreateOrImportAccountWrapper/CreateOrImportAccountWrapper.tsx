import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import YellowLinesTop from 'assets/svgs/onboarding/key-import-lines-top.svg';
import TealLinesBottom from 'assets/svgs/onboarding/key-import-teal-lines-bot.svg';

function CreateOrImportAccountWrapper() {
  const location = useLocation();
  const showBgShapes = !location.pathname.includes('backup');

  return (
    <div className="relative h-full bg-finnieBlue-dark-secondary overflow-hidden">
      <div className="relative z-30 w-full h-full">
        <Outlet />
      </div>

      {showBgShapes && (
        <>
          <YellowLinesTop className="absolute top-0 right-0" />
          <TealLinesBottom className="absolute -bottom-2 -left-48" />
        </>
      )}
    </div>
  );
}

export default CreateOrImportAccountWrapper;
