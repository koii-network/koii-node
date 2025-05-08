import { Icon } from '@_koii/koii-styleguide';
import React from 'react';

import { Button } from 'renderer/components/ui';

function TaskHelperIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="23"
      height="25"
      viewBox="0 0 23 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 20.5588V2.23529C1 1.55306 1.55306 1 2.23529 1H20.7647C21.4469 1 22 1.55306 22 2.23529V20.5588C22 21.2411 21.4469 21.7941 20.7647 21.7941H15.0999C14.7723 21.7941 14.4581 21.9243 14.2264 22.1559L12.3735 24.0089C11.8911 24.4913 11.1089 24.4913 10.6265 24.0089L8.77357 22.1559C8.54191 21.9243 8.22771 21.7941 7.90009 21.7941H2.23529C1.55306 21.7941 1 21.2411 1 20.5588Z"
        stroke="#F1F3F3"
        strokeWidth="1.23529"
      />
      <path
        d="M8.99674 8.25943L10.2988 5.54682C10.7001 4.71085 11.8904 4.71085 12.2916 5.54682L13.5898 8.25143C13.7034 8.48806 13.8975 8.67655 14.1374 8.78315L17.1424 10.1187C18.003 10.5012 18.0216 11.716 17.173 12.1246L14.115 13.5969C13.889 13.7058 13.7066 13.8883 13.5981 14.1145L12.2916 16.8362C11.8904 17.6722 10.7001 17.6722 10.2988 16.8362L8.98834 14.1062C8.88222 13.8851 8.70557 13.7055 8.48621 13.5959L5.52854 12.117C4.69961 11.7026 4.71819 10.5133 5.55966 10.1249L8.46349 8.78468C8.69692 8.67695 8.88548 8.49121 8.99674 8.25943Z"
        fill="#F1F3F3"
      />
    </svg>
  );
}

export const TaskVariableHelper: React.FC = () => {
  const handleOpenHelperPage = () => {
    // Open the landing page in default browser in full screen
    const { width } = window.screen;
    const { height } = window.screen;

    const windowFeatures = `
      width=${width},
      height=${height},
    `.replace(/\s/g, '');

    window.open('http://localhost:30017/task-helper', '_blank', windowFeatures);
  };

  return (
    <div className="mb-8">
      <div className="text-left w-full rounded text-white flex flex-col gap-4">
        <div className="flex items-center gap-4 pt-2 text-2xl font-semibold">
          <Icon source={TaskHelperIcon} className="w-8 h-8" />
          <span>Task Extension Helper</span>
        </div>

        <div className="mr-12 text-sm">
          <p>
            This extension helps you connect your Koii Node to external services
            to run tasks with special features.{' '}
          </p>
          <p>
            The extension&apos;s homepage helps guide you through the process of
            collecting and setting up any required external tool you need to run
            Koii tasks. Examples include allowing access from sites like
            Anthropic and GitHub.
          </p>
        </div>

        <Button
          label="Open Extension Helper"
          onClick={handleOpenHelperPage}
          className="w-64 h-10 font-semibold bg-white text-finnieBlue-light"
        />
      </div>
    </div>
  );
};
