import {
  Icon,
  TooltipChatQuestionRightLine,
  WarningCircleLine,
} from '@_koii/koii-styleguide';
import React, { useState, useRef, MutableRefObject } from 'react';

import { Button } from 'renderer/components/ui';
import { useOnClickOutside } from 'renderer/features/common';
import { openBrowserWindow } from 'renderer/services';

export function ReportBug() {
  const [isReportBugExpanded, setIsReportBugExpanded] = useState(false);

  const buttonClasses = `-mt-48 mr-4 rounded-full hover:bg-finniePurple ${
    isReportBugExpanded ? '!bg-purple-5' : ''
  } h-13 w-13`;

  const redirectToReportForm = () =>
    openBrowserWindow(
      'https://docs.google.com/forms/d/e/1FAIpQLSe5_gRJ4hHOvIF_AHHK1TqFz2J3DzqWhkcm7AyAicPkQyTrrA/viewform'
    );

  const close = () => setIsReportBugExpanded(false);

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as MutableRefObject<HTMLDivElement>, close);

  return (
    <div className="relative" ref={ref}>
      <Button
        onClick={() => setIsReportBugExpanded((isExpanded) => !isExpanded)}
        onlyIcon
        icon={
          <Icon source={TooltipChatQuestionRightLine} className="h-7 w-7" />
        }
        className={buttonClasses}
      />

      {isReportBugExpanded && (
        <button
          onClick={redirectToReportForm}
          className="flex gap-2 text-white cursor-pointer items-center z-10 bg-[url(assets/svgs/report-bg.png)] -top-[58px] bg-cover text-base absolute right-0 w-[273px] h-10 pl-4 rounded-lg"
        >
          <Icon source={WarningCircleLine} className="h-[18px]" />
          Report a bug
        </button>
      )}
    </div>
  );
}
