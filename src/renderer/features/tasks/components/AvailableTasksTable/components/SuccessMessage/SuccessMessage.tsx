import React from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import CheckMarkTealIcon from 'assets/svgs/checkmark-teal-icon.svg';
import { AppRoute } from 'renderer/types/routes';

export function SuccessMessage({
  outerClassNames,
  iconWrapperClass,
}: {
  outerClassNames?: string;
  iconWrapperClass?: string;
}) {
  const baseClasses =
    'h-[67px] w-full flex justify-start items-center text-white border-b-2 border-white relative';
  const overlayClasses = 'h-full w-full absolute bg-[#9BE7C4] opacity-30';
  const iconClasses = 'w-[45px] h-[45px] z-10';
  const iconWrapperClasses = twMerge('mr-5', iconWrapperClass); // Padding applied here
  const linkClasses = 'text-[#5ED9D1] underline';

  const classes = twMerge(baseClasses, outerClassNames);

  return (
    <div className={classes}>
      <div className={overlayClasses} />
      <div className={iconWrapperClasses}>
        <CheckMarkTealIcon className={iconClasses} />{' '}
        {/* Icon now inside a wrapper div */}
      </div>
      <div className="z-10">
        <p>
          You’re successfully running this task. Head over to{' '}
          <NavLink to={AppRoute.MyNode} className={linkClasses}>
            My Node
          </NavLink>{' '}
          to monitor your rewards
        </p>
      </div>
    </div>
  );
}
